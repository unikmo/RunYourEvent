import {cookies} from 'next/headers'
import {NextRequest,NextResponse} from 'next/server'
import {isSameOrigin} from '@/lib/request-origin'
import {createServerClient} from '@/lib/supabase-server'
export async function POST(req:NextRequest){
 if(!isSameOrigin(req))return NextResponse.json({error:'Invalid origin'},{status:403})
 const token=(await cookies()).get('rye_club_access')?.value
 if(!token)return NextResponse.json({error:'Sign in to your club'},{status:401})
 try{const raw=await req.text();if(raw.length>5000)return NextResponse.json({error:'Request too large'},{status:413});const b=JSON.parse(raw);if(typeof b.address!=='string')return NextResponse.json({error:'Enter the billing address'},{status:400});const r=await createServerClient().rpc('rye_update_billing_address',{p_token:token,p_address:b.address});if(r.error)throw Error();return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Address could not be saved'},{status:400})}
}
