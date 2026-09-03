import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'
import { mirrorOpportunityToFirebase, safeFirebaseMirror } from '@/lib/firebase-volunteer-mirror'

export const runtime='nodejs'; export const dynamic='force-dynamic'

export async function POST(req:NextRequest){
  try{
    const session=await getAdminSession(); if(!session) return NextResponse.json({error:'Unauthorized'},{status:401})
    const b=await req.json(); const slots=Number.parseInt(String(b.slots||''),10)
    if(!b.requestId||!b.title||!b.eventDay||!b.shiftStart||!b.shiftEnd||!Number.isInteger(slots)||slots<1) return NextResponse.json({error:'Complete the shift details.'},{status:400})
    const title=String(b.title).slice(0,160)
    const roleDescription=String(b.roleDescription||b.title).slice(0,1500)
    const venue=String(b.venue||'').slice(0,240)||null
    const transportMode=String(b.transportMode||'independent')
    const transportDetails=String(b.transportDetails||'').slice(0,1000)||null
    const db=createServerClient(); const {data,error}=await db.rpc('rye_admin_create_volunteer_opportunity',{p_token:session.token,p_request_id:b.requestId,p_title:title,p_event_day:b.eventDay,p_shift_start:b.shiftStart,p_shift_end:b.shiftEnd,p_slots:slots,p_role_description:roleDescription,p_venue:venue,p_transport_mode:transportMode,p_transport_details:transportDetails})
    if(error||!data) return NextResponse.json({error:error?.message||'Shift could not be opened.'},{status:400})

    await safeFirebaseMirror(mirrorOpportunityToFirebase({
      supabaseId:String(data),
      organizerRequestId:String(b.requestId),
      title,
      eventDay:String(b.eventDay),
      shiftStart:String(b.shiftStart),
      shiftEnd:String(b.shiftEnd),
      slotsTotal:slots,
      roleDescription,
      venue,
      transportMode,
      transportDetails,
    }),'volunteer opportunity')

    return NextResponse.json({ok:true,opportunityId:data})
  }catch(error){console.error(error);return NextResponse.json({error:'Shift could not be opened.'},{status:500})}
}
