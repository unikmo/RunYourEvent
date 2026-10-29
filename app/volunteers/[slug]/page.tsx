import {statusLabel} from '@/lib/german'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic='force-dynamic'
export const metadata:Metadata={title:"Freiwilliges Engagement",robots:{index:false,follow:false}}
type Activity={title:string;organization_name:string;event_day:string;verified_minutes:number}
type Certificate={certificate_code:string;tier:string;hand_signed_at?:string|null;revoked_at?:string|null}
type Passport={display_name:string;credited_minutes:number;tier:string;activities:Activity[];certificates:Certificate[]}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  if(slug.length<3||slug.length>60||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))notFound()
  let passport:Passport|null=null
  try{const {data,error}=await createServerClient().rpc('rye_public_volunteer_passport',{p_slug:slug});if(error)throw error;passport=data as Passport|null}catch{return <main className="shell max-w-3xl section-pad"><p className="eyebrow">Freiwilliges Engagement</p><h1 className="section-title mt-5">Diese Seite lässt sich gerade nicht laden.</h1><p className="lede mt-6">Bitte versuch es später noch einmal. Das öffentliche Engagementprofil konnte nicht geladen werden.</p></main>}
  if(!passport)notFound()
  const tier=passport.tier&&passport.tier!=='none'?statusLabel(passport.tier):"Mit jeder Stunde etwas bewegen"
  const certificates=(passport.certificates||[]).filter(c=>!c.revoked_at&&(c.tier.toLowerCase()!=='gold'||c.hand_signed_at))
  return <main className="shell max-w-5xl section-pad"><p className="eyebrow">RunYourEvent · bestätigtes Engagement</p><h1 className="premium-section mt-5">{passport.display_name}</h1><p className="lede mt-7">Für den Sport vor Ort da sein. Mit der eigenen Zeit etwas bewegen.</p><div className="mt-10 grid gap-5 sm:grid-cols-2"><div className="panel p-7"><p className="eyebrow">Bestätigte Stunden</p><p className="mt-4 text-5xl font-black">{((Number(passport.credited_minutes)||0)/60).toLocaleString('de-DE',{maximumFractionDigits:1})}<span className="ml-3 text-lg">Stunden</span></p></div><div className="panel p-7"><p className="eyebrow">Anerkennung</p><p className="mt-4 text-3xl font-black">{tier}</p><p className="mt-3 text-sm text-[#667184]">Bronze 20 Std. · Silber 40 Std. · Gold 60 Std.</p></div></div><section className="mt-12"><h2 className="text-2xl font-black">Engagementnachweis</h2><div className="mt-5 divide-y divide-[#ded9cf] border-y border-[#ded9cf]">{passport.activities?.length?passport.activities.map((a,index)=><div key={`${a.event_day}-${index}`} className="grid gap-2 py-5 sm:grid-cols-[1fr_130px_100px]"><div><p className="font-bold">{a.title}</p><p className="mt-1 text-sm text-[#667184]">{a.organization_name}</p></div><p className="text-sm">{a.event_day}</p><p className="text-sm font-bold">{(a.verified_minutes/60).toLocaleString('de-DE',{maximumFractionDigits:1})} Stunden</p></div>):<p className="py-6 text-sm text-[#667184]">Es wurden noch keine bestätigten Einsätze veröffentlicht.</p>}</div></section><section className="mt-10"><h2 className="text-2xl font-black">Ausgestellte Urkunden</h2><div className="mt-5 flex flex-wrap gap-4">{certificates.length?certificates.map(c=><Link key={c.certificate_code} className="btn-secondary capitalize" href={`/certificates/${c.certificate_code}`}>{statusLabel(c.tier)} · Urkunde prüfen</Link>):<p className="text-sm leading-7 text-[#667184]">Es werden keine ausgestellten Urkunden angezeigt.</p>}</div></section><p className="mt-10 max-w-3xl text-sm leading-7 text-[#667184]">Dieser Nachweis dokumentiert abgeschlossene und vom Verein bestätigte Einsatzzeiten. Er bestätigt das Engagement, keine akademische Qualifikation und keine geprüften Fähigkeiten.</p><Link href="/volunteer-engine/volunteers" className="btn-primary mt-7">Mach selbst mit</Link></main>
}
