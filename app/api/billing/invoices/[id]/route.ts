import {cookies} from 'next/headers'
import {NextRequest,NextResponse} from 'next/server'
import {createHash} from 'node:crypto'
import {createServerClient,getServerSupabase} from '@/lib/supabase-server'
import {getAdminSession} from '@/lib/admin-auth'
import {renderInvoice} from '@/lib/invoice-core'
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return new NextResponse(null,{status:404})
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}
 try{
  const jar=await cookies();let allowed=!!await getAdminSession()
  const clubToken=jar.get('rye_club_access')?.value
  if(!allowed&&clubToken){const r=await createServerClient().rpc('rye_club_billing',{p_token:clubToken});allowed=!!r.data?.invoices?.some((i:any)=>i.id===id)}
  const db=getServerSupabase();const {data:i,error}=await db.from('rye_invoices').select('*').eq('id',id).single()
  if(!allowed&&i?.order_id){const token=jar.get('rye_order_access')?.value;if(token){const {data:o}=await db.from('rye_orders').select('id').eq('id',i.order_id).eq('access_hash',createHash('sha256').update(token).digest('hex')).single();allowed=!!o}}
  if(!allowed||error||!i?.snapshot||!i.sent_at)return new NextResponse(null,{status:404,headers})
  return new NextResponse(renderInvoice(i.snapshot),{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox",'Content-Disposition':`attachment; filename="${i.invoice_number}.html"`}})
 }catch{return new NextResponse(null,{status:503,headers})}
}
