import { isSameOrigin } from '@/lib/request-origin'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
export const runtime='nodejs';export const dynamic='force-dynamic'
export async function POST(req:NextRequest){
 try{
  if(!isSameOrigin(req))return NextResponse.json({error:'Request origin is not allowed.'},{status:403})
  const token=(await cookies()).get('rye_club_access')?.value
  if(!token||!/^[a-f0-9]{48}$/.test(token))return NextResponse.json({error:'Open your club workspace on your registered device.'},{status:401})
  const raw=await req.text();if(raw.length>18000)return NextResponse.json({error:'Request is too large.'},{status:413})
  let b;try{b=JSON.parse(raw)}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
  if(!b||!['publish_activity','verify_placement','invite_volunteer','report_issue','cancel_activity'].includes(b.action))return NextResponse.json({error:'Invalid club action.'},{status:400})
  const db=createServerClient(); const {data,error}=await db.rpc('rye_club_action',{p_token:token,p_action:b.action,p_payload:b.payload||b})
  if(error)return NextResponse.json({error:error.code==='P0001'?error.message:'The service is temporarily unavailable.'},{status:error.code==='P0001'?409:503})
  return NextResponse.json({ok:true,result:data})
 }catch{return NextResponse.json({error:'The club workspace is temporarily unavailable.'},{status:503})}
}
