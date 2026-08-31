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
    <p className="eyebrow">Volunteer Engine · Event attendance</p>
    <h1 className="premium-section mt-5">Event-day check-in.</h1>
    {!data?<div className="mt-8 border-y border-black/[0.08] py-6"><p className="text-sm font-black text-[#182237]">This device is not signed in for this shift.</p><p className="mt-2 text-sm leading-6 text-[#667184]">Open the personal RunYourEvent shift invitation you accepted, then scan the event QR again on the same device. The QR alone cannot create attendance for an unassigned person.</p></div>:<>
      <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]"><div className="py-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">Shift</p><p className="mt-2 text-lg font-black text-[#182237]">{data.title}</p><p className="mt-1 text-sm text-[#667184]">{data.organizationName} · {data.venue}</p></div></div>
      <VolunteerAttendanceActions eventCode={eventCode} initial={data}/>
      <p className="mt-5 text-xs leading-5 text-[#7b8493]">For one-off events, a successful placement becomes billable only when the assigned volunteer checks in. Check-out records time for organizer verification and volunteer points.</p>
    </>}
  </section></main>
}
