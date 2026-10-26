import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import VolunteerAttendanceActions from '@/components/VolunteerAttendanceActions'

export const dynamic='force-dynamic'
const COOKIE='rye_volunteer_access'

export default async function Page({searchParams}:{searchParams:Promise<{event?:string}>}){
  const {event}=await searchParams; const eventCode=typeof event==='string'?event:''
  const store=await cookies(); const inviteToken=store.get(COOKIE)?.value||''
  let data:any=null
  if(/^[a-f0-9]{24}$/i.test(eventCode)&&/^[a-f0-9]{48}$/i.test(inviteToken)){
    const db=createServerClient(); const result=await db.rpc('rye_volunteer_event_status',{p_invite_token:inviteToken,p_event_code:eventCode}); if(!result.error) data=result.data
  }
  return <main className="bg-[#f7f5ef]"><section className="shell max-w-3xl py-20 sm:py-24">
    <p className="eyebrow">Sports volunteer activity · Attendance</p>
    <h1 className="premium-section mt-5">Activity check-in.</h1>
    {!data?<div className="mt-8 border-y border-black/[0.08] py-6"><p className="text-sm font-black text-[#182237]">This device is not signed in for this activity.</p><p className="mt-2 text-sm leading-6 text-[#667184]">Open the personal RunYourEvent activity invitation you accepted, then scan the club QR again on the same device.</p></div>:<>
      <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]"><div className="py-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">Activity</p><p className="mt-2 text-lg font-black text-[#182237]">{data.title}</p><p className="mt-1 text-sm text-[#667184]">{data.organizationName} · {data.venue}</p></div></div>
      <VolunteerAttendanceActions eventCode={eventCode} initial={data}/>
      <p className="mt-5 text-xs leading-5 text-[#7b8493]">Check-in records arrival. Check-out records completion and volunteer time. The €10 organizer platform fee applies only after the volunteer completes the activity.</p>
    </>}
  </section></main>
}
