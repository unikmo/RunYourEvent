import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'

export const runtime='nodejs'; export const dynamic='force-dynamic'

export async function POST(req:NextRequest){
  try{
    const session=await getAdminSession(); if(!session) return NextResponse.json({error:'Unauthorized'},{status:401})
    const b=await req.json(); const slots=Number.parseInt(String(b.slots||''),10)
    if(!b.requestId||!b.title||!b.eventDay||!b.shiftStart||!b.shiftEnd||!Number.isInteger(slots)||slots<1) return NextResponse.json({error:'Complete the shift details.'},{status:400})
    const db=createServerClient(); const {data,error}=await db.rpc('rye_admin_create_volunteer_opportunity',{p_token:session.token,p_request_id:b.requestId,p_title:String(b.title).slice(0,160),p_event_day:b.eventDay,p_shift_start:b.shiftStart,p_shift_end:b.shiftEnd,p_slots:slots,p_role_description:String(b.roleDescription||b.title).slice(0,1500),p_venue:String(b.venue||'').slice(0,240)||null,p_transport_mode:String(b.transportMode||'independent'),p_transport_details:String(b.transportDetails||'').slice(0,1000)||null})
    if(error||!data) return NextResponse.json({error:error?.message||'Shift could not be opened.'},{status:400})
    return NextResponse.json({ok:true,opportunityId:data})
  }catch(error){console.error(error);return NextResponse.json({error:'Shift could not be opened.'},{status:500})}
}
