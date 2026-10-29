import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import Link from 'next/link'
import SeasonalNeedsForm from '@/components/SeasonalNeedsForm'

export const metadata: Metadata = pageMetadata({title:"Unterstützung für deine Vereinssaison | RunYourEvent",description:"Plane, wo dein Sportverein Unterstützung braucht – für einzelne freiwillige Einsätze oder einen ganzen Projekttag mit einem Unternehmen.",alternates:{canonical:'/seasonal-needs'}})

export default function SeasonalNeedsPage() {
  return <main className="bg-[#f7f5ef]">
    <section className="border-b border-black/[0.06]"><div className="shell py-20 sm:py-24"><p className="eyebrow">Für Sportvereine</p><h1 className="premium-section mt-5 max-w-4xl">Plane deine Saison.<br/>Zeig, wo Hilfe gebraucht wird.</h1><p className="lede mt-6 max-w-2xl">Vier Stunden beim Turnier oder ein ganzer Tag am Vereinsheim: Beschreibe konkret, wo dein Verein Unterstützung braucht. So können Freiwillige und Sponsoren entscheiden, wie sie helfen möchten.</p><Link href="/opportunities" className="text-link mt-6">Vereinsprojekte ansehen →</Link></div></section>
    <section className="bg-white py-20"><div className="shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
      <aside><p className="eyebrow">Von der Anfrage zum Einsatz</p><div className="rule-list mt-6 text-sm leading-6 text-[#667184]">{[
        ["Beschreibe euren Bedarf","Nenne für jede Aufgabe die Termine, Anzahl der Helfer, Stunden und Voraussetzungen – auch bei wiederkehrenden Einsätzen."],
        ["Mach Sponsoring möglich","Sponsoring ist ab 25 Stunden möglich. Auch ein kleinerer Einsatz kann Teil eines Pakets mit mehreren Projekten sein. Umfang und Kosten werden vor dem Start vereinbart."],
        ["Finde die passenden Freiwilligen","Auch ein finanziertes Projekt braucht Menschen, die mithelfen. Finanzierung, besetzte Plätze und geleistete Stunden werden getrennt erfasst."],
        ["Halte die geleistete Hilfe fest","Anmeldung, Abmeldung und die Bestätigung durch den Verein dokumentieren die tatsächliche Teilnahme."],
      ].map(([title,body])=><p key={title} className="py-5"><b className="text-[#182237]">{title}</b><br/>{body}</p>)}</div><p className="mt-6 text-sm leading-6 text-[#667184]">Der Verein bleibt für geeignete Aufgaben, Betreuung, den Schutz von Minderjährigen und Sicherheit verantwortlich. Versicherung, Materialien und Transport werden bei Bedarf separat vereinbart.</p></aside>
      <div><h2 className="text-2xl font-black tracking-[-0.03em]">Sag uns, wo dein Verein Hilfe braucht</h2><SeasonalNeedsForm /></div>
    </div></section>
  </main>
}
