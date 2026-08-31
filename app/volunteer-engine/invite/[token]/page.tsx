import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import VolunteerInviteActions from '@/components/VolunteerInviteActions'

export const dynamic='force-dynamic'

function transportLabel(mode:string){return ({independent:'Independent arrival',public_transport:'Public transport',local_reimbursement:'Local transport reimbursed',station_shuttle:'Station / central shuttle',organizer_transport:'Organizer-provided transport'} as Record<string,string>)[mode]||mode}

export default async function Page({params}:{params:Promise<{token:string}>}){
  const {token}=await params
  if(!/^[a-f0-9]{48}$/i.test(token)) notFound()
  const db=createServerClient(); const {data,error}=await db.rpc('rye_volunteer_invite_lookup',{p_invite_token:token})
  if(error||!data) notFound()
  const row=data as any; const o=row.opportunity||{}; const v=row.volunteer||{}
  const start=o.shiftStart?new Date(o.shiftStart):null; const end=o.shiftEnd?new Date(o.shiftEnd):null
  return <main className="bg-[#f7f5ef]"><section className="shell max-w-4xl py-20 sm:py-24">
    <p className="eyebrow">Volunteer Engine · Shift invitation</p>
    <h1 className="premium-section mt-5">{v.firstName}, this shift is yours to choose.</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#646f80]">Accepting confirms this specific assignment only. It does not commit you to future events.</p>
    <div className="mt-10 divide-y divide-black/[0.08] border-y border-black/[0.08]">
      {[
        ['Role',o.title],['Organizer',o.organizationName],['Event',o.eventName||o.title],['Location',[o.venue,o.city].filter(Boolean).join(' · ')],['Date',o.eventDay],['Time',start&&end?`${start.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}–${end.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:'—'],['Transport',transportLabel(o.transportMode)],['Transport details',o.transportDetails||'—']
      ].map(([label,value])=><div key={label} className="grid gap-2 py-5 sm:grid-cols-[170px_1fr]"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">{label}</p><p className="text-sm font-bold leading-6 text-[#283449]">{value}</p></div>)}
    </div>
    <p className="mt-6 text-sm leading-6 text-[#667184]">RunYourEvent recruits and matches volunteers but cannot guarantee that any person will attend an event. Once you accept, we ask you to reconfirm before the shift. At the venue, scan the organizer's RunYourEvent QR on this same device to check in.</p>
    <VolunteerInviteActions token={token} initialStatus={row.status}/>
  </section></main>
}
