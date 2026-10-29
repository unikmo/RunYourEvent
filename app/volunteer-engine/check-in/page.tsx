import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import VolunteerAttendanceActions from '@/components/VolunteerAttendanceActions'

export const dynamic='force-dynamic'
const COOKIE='rye_volunteer_access'

export default async function Page({searchParams}:{searchParams:Promise<{event?:string}>}){
  const {event}=await searchParams; const eventCode=typeof event==='string'?event:''
  const store=await cookies(); const inviteToken=store.get(COOKIE)?.value||''
  let data:any=null;let unavailable=false
  if(/^[a-f0-9]{24}$/i.test(eventCode)&&/^[a-f0-9]{48}$/i.test(inviteToken)){
    try{const db=createServerClient();const result=await db.rpc('rye_volunteer_event_status',{p_invite_token:inviteToken,p_event_code:eventCode});if(result.error)unavailable=true;else data=result.data}catch{unavailable=true}
  }
  return <main className="bg-[#f7f5ef]"><section className="shell max-w-3xl py-20 sm:py-24">
    <p className="eyebrow">Freiwilliger Einsatz · Anwesenheit</p>
    <h1 className="premium-section mt-5">Melde dich vor Ort an.</h1>
    {!data?<div className="mt-8 border-y border-black/[0.08] py-6"><p className="text-sm font-black text-[#182237]">{unavailable?"Die Anwesenheitsdaten lassen sich gerade nicht laden.":"Dieser Einsatz konnte auf diesem Gerät nicht geöffnet werden."}</p><p className="mt-2 text-sm leading-6 text-[#667184]">{unavailable?"Deine Anwesenheit können wir gerade nicht bestätigen. Bitte versuch es erneut oder bitte den Verein, das Problem zu dokumentieren.":"Öffne die Einladung, für die du zugesagt hast, oder melde dich bei deinem Engagementpass an. Scanne danach den QR-Code des Vereins erneut."}</p><Link href="/access?role=volunteer" className="text-link mt-4">Bei deinem Engagementpass anmelden →</Link></div>:<>
      <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]"><div className="py-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">Einsatz</p><p className="mt-2 text-lg font-black text-[#182237]">{data.title}</p><p className="mt-1 text-sm text-[#667184]">{data.organizationName} · {data.venue}</p></div></div>
      <VolunteerAttendanceActions eventCode={eventCode} initial={data}/>
      <p className="mt-5 text-xs leading-5 text-[#7b8493]">Mit der Anmeldung erfasst du deine Ankunft, mit der Abmeldung das Ende deines Einsatzes. Der Verein bestätigt die tatsächliche Zeit ohne Pausen. Erst dann zählt sie für Anerkennungen und eine mögliche Abrechnung. Als Freiwilliger zahlst du keine Vermittlungsgebühr.</p>
    </>}
  </section></main>
}
