import {statusLabel} from '@/lib/german'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import VolunteerInviteActions from '@/components/VolunteerInviteActions'
import Link from 'next/link'

export const dynamic='force-dynamic'
function transportLabel(mode:string){return ({independent:"Eigene Anreise",public_transport:"Öffentliche Verkehrsmittel",local_reimbursement:"Vereinbarte Fahrtkosten werden erstattet",station_shuttle:'Station / central shuttle',organizer_transport:"Der Verein organisiert den Transport"} as Record<string,string>)[mode]||mode}

export default async function Page({params}:{params:Promise<{token:string}>}){
  const {token}=await params
  if(!/^[a-f0-9]{48}$/i.test(token)) notFound()
  let data:any=null;let unavailable=false
  try{const r=await createServerClient().rpc('rye_volunteer_invite_lookup',{p_invite_token:token});if(r.error)unavailable=true;else data=r.data}catch{unavailable=true}
  if(unavailable)return <main className="shell section-pad"><h1 className="section-title">Deine Einladung lässt sich gerade nicht laden.</h1><p className="lede mt-5">Wir konnten den Einsatz und seinen aktuellen Stand nicht laden. Bitte versuch es später noch einmal.</p></main>
  if(!data)notFound()
  const row=data as any; const o=row.opportunity||{}; const v=row.volunteer||{}
  const start=o.shiftStart?new Date(o.shiftStart):null; const end=o.shiftEnd?new Date(o.shiftEnd):null
  return <main className="bg-[#f7f5ef]"><section className="shell max-w-4xl py-20 sm:py-24">
    <p className="eyebrow">Freiwilliger Einsatz im Sport</p>
    <h1 className="premium-section mt-5">{v.firstName}, du entscheidest, ob du mitmachst.</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#646f80]">Deine Zusage gilt nur für diesen Einsatz{start&&end?` (${Math.round((end.getTime()-start.getTime())/360000)/10} Stunden)`:''}. Du verpflichtest dich zu keinen weiteren Einsätzen.</p>
    <div className="mt-10 divide-y divide-black/[0.08] border-y border-black/[0.08]">
      {[
        ["Aufgabe",o.title],['Club / organizer',o.organizationName],["Einsatz",o.eventName||o.title],["Ort",[o.venue,o.city].filter(Boolean).join(' · ')],["Datum",o.eventDay],['Time · Europe/Berlin',start&&end?start.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'})+'–'+end.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'}):'—'],["An- und Abreise",transportLabel(o.transportMode)],["Hinweise zur An- und Abreise",o.transportDetails||'—']
      ].map(([label,value])=><div key={label} className="grid gap-2 py-5 sm:grid-cols-[170px_1fr]"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">{label}</p><p className="text-sm font-bold leading-6 text-[#283449]">{value}</p></div>)}
    </div>
    <p className="mt-6 text-sm leading-6 text-[#667184]">RunYourEvent bringt Vereine und Freiwillige zusammen, kann eine Teilnahme aber nicht garantieren. Nach deiner Zusage bitten wir dich vor dem Einsatz um eine erneute Bestätigung. Scanne vor Ort den RunYourEvent-QR-Code auf demselben Gerät, um dich anzumelden.</p>
    <VolunteerInviteActions token={token} initialStatus={statusLabel(row.status)}/>
    <div className="mt-8 border-t border-black/[0.08] pt-6"><Link className="text-link" href="/volunteer">Deinen Engagementpass öffnen</Link><p className="mt-3 text-sm leading-6 text-[#667184]">Nach deiner Zusage kannst du auf diesem Gerät deine bestätigten Stunden, Anerkennungen und Einstellungen zur Sichtbarkeit ansehen.</p></div>
  </section></main>
}
