import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { stableFirestoreId } from '@/lib/firebase-firestore'
import { mirrorVolunteerActivityToFirebase, safeFirebaseMirror } from '@/lib/firebase-volunteer-mirror'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const COOKIE='rye_volunteer_access'

export async function POST(req:NextRequest){
  try{
    const store=await cookies(); const inviteToken=store.get(COOKIE)?.value||''
    const body=await req.json(); const eventCode=typeof body.eventCode==='string'?body.eventCode.trim():''; const action=String(body.action||'')
    if(!/^[a-f0-9]{48}$/i.test(inviteToken)||!/^[a-f0-9]{24}$/i.test(eventCode)||!['check_in','check_out'].includes(action)) return NextResponse.json({error:'This QR attendance session is not valid.'},{status:400})
    const db=createServerClient(); const {data,error}=await db.rpc('rye_volunteer_event_action',{p_invite_token:inviteToken,p_event_code:eventCode,p_action:action})
    if(error||!data) return NextResponse.json({error:error?.message||'Attendance could not be recorded.'},{status:409})

    await safeFirebaseMirror(mirrorVolunteerActivityToFirebase('attendance',{
      inviteTokenHash:stableFirestoreId(inviteToken),
      eventCodeHash:stableFirestoreId(eventCode),
      action,
      recorded:true,
    }),'attendance')

    return NextResponse.json({ok:true,attendance:data})
  }catch(error){console.error('Volunteer attendance failed',error);return NextResponse.json({error:'Attendance could not be recorded.'},{status:500})}
}
