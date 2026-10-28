import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = pageMetadata({
  title: "Im Sportverein mithelfen | Einsätze von 2–4 Stunden",
  description: "Hilf 2–4 Stunden im Sportverein. Dein Verein zahlt 10 € pro Person nach bestätigtem Einsatz. Sammle bestätigte Stunden für Bronze, Silber und Gold.",
  alternates: { canonical: '/volunteer-engine' },
})

const roles = [
  ["Aufbau am Spieltag", "2 Stunden"],
  ["Einlass & Gästebetreuung", "2–3 Stunden"],
  ["Verpflegungsstand", "2–4 Stunden"],
  ["Turnierbüro", "2–4 Stunden"],
  ["Anzeigetafel betreuen", "2–4 Stunden"],
  ["Fotos & Vereinsbeiträge", "2–4 Stunden"],
]

export default function VolunteerEnginePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-8 sm:py-12 lg:py-14">
          <div className="max-w-5xl">
            <p className="eyebrow">Freiwillig im Sport helfen</p>
            <h1 className="premium-hero mt-6 max-w-[980px]">Bring 2–4 Stunden mit.<br /><span className="text-[#9a741c]">Mach Sport vor Ort möglich.</span></h1>
            <p className="mt-8 max-w-[760px] text-[18px] leading-8 text-[#646f80] sm:text-xl">Mit RunYourEvent findest du überschaubare Aufgaben im Sportverein. Du sagst für einen konkreten Einsatz zu und entscheidest danach selbst, ob du wieder mitmachst.</p>
            <div className="mt-10 flex flex-wrap gap-3"><a href="/club" className="btn-primary">Ich suche Freiwillige <ArrowRight className="ml-2" size={16}/></a><a href="/volunteer-engine/volunteers" className="btn-secondary">Ich möchte helfen</a></div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-20 text-white sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Mit wenig Zeit viel bewegen</p><h2 className="mt-5 max-w-xl text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">Eine Aufgabe, die zu dir passt.</h2><p className="mt-6 max-w-lg text-base leading-7 text-white/58">Bevor du zusagst, kennst du Aufgabe, Ort und den Zeitraum von 2–4 Stunden. Teameinsätze über deinen Arbeitgeber können bis zu acht Stunden dauern.</p></div>
          <div className="divide-y divide-white/10 border-y border-white/10">{roles.map(([role,duration]) => <div key={role} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center"><p className="font-bold text-white/88">{role}</p><p className="text-sm font-black text-[#e7c66f]">{duration}</p></div>)}</div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <div><p className="eyebrow">Sportvereine</p><h2 className="premium-section mt-5">10 € pro Person nach bestätigtem Einsatz.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">Veröffentliche den Bedarf deines Vereins und schreibe Einsätze aus. Freiwillige wählen eine Aufgabe. Du sprichst dich direkt mit ihnen ab und bestätigst ihre Stunden. Ein Sponsor kann die Vermittlungsgebühr von 10 € übernehmen.</p><a href="/club" className="btn-primary mt-8">Unterstützung finden <ArrowRight className="ml-2" size={16}/></a></div>
          <div><p className="eyebrow">Für alle Freiwilligen</p><h2 className="premium-section mt-5">20. 40. 60 Stunden.<br />Anerkennung, die mitwächst.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">Deine bestätigten Stunden aus verschiedenen Einsätzen zählen zusammen. Ab 20 Stunden erreichst du Bronze, ab 40 Silber und ab 60 Gold mit einer von Hand unterschriebenen Urkunde.</p><a href="/volunteer-engine/volunteers" className="btn-secondary mt-8">Als Freiwilliger registrieren</a></div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-20 sm:py-24">
        <div className="shell">
          <p className="eyebrow">So funktioniert’s</p>
          <div className="mt-8 grid border-y border-black/[0.08] md:grid-cols-4">
            {[
              ['1',"Der Verein schreibt einen Einsatz aus","Eine klare Aufgabe für 2–4 Stunden – mit Ort und Uhrzeit."],
              ['2',"Du entscheidest dich fürs Mitmachen","Du sagst für diesen Einsatz zu. Weitere Verpflichtungen entstehen dadurch nicht."],
              ['3',"Der Verein bestätigt deine Teilnahme","Du meldest dich an und wieder ab. Der Verein bestätigt die tatsächlich geleisteten Stunden."],
              ['4',"Deine Stunden zählen zusammen","Bestätigte Stunden bringen dich näher an Bronze, Silber und Gold."],
            ].map(([n,title,body],i) => <article key={n} className={'py-8 md:px-7 ' + (i>0?'border-t border-black/[0.08] md:border-l md:border-t-0':'')}><p className="text-xs font-black text-[#9a741c]">{n}</p><h3 className="mt-5 font-black text-[#182237]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667184]">{body}</p></article>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#667184]"><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>2–4 Stunden pro Einsatz</span><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>10 € pro Person nach bestätigtem Einsatz</span><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>Bronze, Silber und Gold ab 20, 40 und 60 Stunden</span></div>
        </div>
      </section>
    </main>
  )
}
