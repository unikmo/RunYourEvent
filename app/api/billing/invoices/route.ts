import {cookies} from 'next/headers'
import {createHash} from 'node:crypto'
import {NextRequest,NextResponse} from 'next/server'
import {isSameOrigin} from '@/lib/request-origin'
import {createServerClient,getServerSupabase} from '@/lib/supabase-server'

export const runtime='nodejs';export const dynamic='force-dynamic'
export async function POST(req:NextRequest){
 if(!isSameOrigin(req))return NextResponse.json({error:'Invalid request origin'},{status:403})
 try{
  const raw=await req.text();if(raw.length>10000)return NextResponse.json({error:'Request too large'},{status:413})
  const b=JSON.parse(raw);if(!b.companyToken)return NextResponse.json({error:'Community sponsorship starts with an hour-target quote. Choose at least 25 hours at /sponsors; an enquiry does not create an invoice.'},{status:409});const service=getServerSupabase()
  const rate=await service.rpc('rye_invoice_request_rate',{p_bucket:createHash('sha256').update((req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown')+(process.env.CRON_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY)).digest('hex')});if(rate.error||rate.data!==true)return NextResponse.json({error:'Please wait before starting another invoice'},{status:429})
  let companyId:string|undefined;if(b.companyToken){const c=await createServerClient().rpc('rye_company_workspace',{p_token:b.companyToken});if(c.error||!c.data)return NextResponse.json({error:'Corporate workspace is not authorized'},{status:401});companyId=c.data.booking.id}
  const savedToken=(await cookies()).get('rye_order_access')?.value;let reuse:any=null
  if(savedToken){const found=await service.from('rye_orders').select('*').eq('access_hash',createHash('sha256').update(savedToken).digest('hex')).eq('status','pending').single();if(found.data&&(b.companyToken?found.data.kind==='corporate'&&found.data.booking_id===companyId:found.data.need_id===b.needId)){if(!b.companyToken&&found.data.amount_cents!==b.amountCents)return NextResponse.json({error:'An invoice with a different amount is pending. Contact support to correct it before requesting another.'},{status:409});reuse={id:found.data.id,accessToken:savedToken,amountCents:found.data.amount_cents,expiresAt:found.data.expires_at};}}

  const prepared=reuse?{data:reuse,error:null}:await service.rpc('rye_create_order',{p_payload:b,p_company_token:typeof b.companyToken==='string'&&/^[a-f0-9]{48}$/.test(b.companyToken)?b.companyToken:null});const {data,error}=prepared
  if(error||!data)return NextResponse.json({error:error?.code==='P0001'?error.message:'Order could not be prepared'},{status:409})
  const jar=await cookies();jar.set('rye_order_access',data.accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30})
  const origin=req.headers.get('origin')!
  const response=NextResponse.json({url:origin+'/sponsorship/success?order='+data.id})
  response.cookies.set('rye_order_access',data.accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});return response
 }catch{return NextResponse.json({error:'Invoice request is unavailable. Please retry or contact support.'},{status:503})}
}
