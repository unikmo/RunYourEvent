import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = pageMetadata({
  title: { absolute: "RunYourEvent Preise | Vereine, Sponsoring & Teameinsätze" },
  description: "Vereine zahlen 10 € pro Person nach bestätigtem Einsatz. Sponsoring ist ab 25 Stunden möglich, Teameinsätze erhalten ein eigenes Angebot. Für Freiwillige ist die Teilnahme kostenlos.",
  alternates: { canonical: '/pricing' },
})

export default function PricingPage() {
  return (
    <main className="bg-[#f7f5ef]">
      <section className="relative isolate overflow-hidden border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-8 text-center sm:py-12 lg:py-14">
          <p className="eyebrow">Preise</p>
          <h1 className="premium-hero mx-auto mt-7 max-w-5xl">Klare Preise.<br /><span className="text-[#9a741c]">Vorher wissen, was dazugehört.</span></h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#646f80]">Für einzelne freiwillige Einsätze, Sponsoring und Teameinsätze gelten unterschiedliche Preise. Bevor du zusagst, erfährst du, welche Leistungen enthalten sind und welche Steuern oder zusätzlichen Kosten anfallen.</p>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="eyebrow">Für Vereine &amp; Veranstalter</p>
            <p className="mt-5 text-7xl font-black tracking-[-0.07em] text-[#101827]">€10</p>
            <p className="mt-2 text-sm font-bold text-[#7b8493]">pro Person nach bestätigtem Einsatz</p>
            <a href="/volunteer-engine/organizers" className="btn-primary mt-8">Einsatz ausschreiben <ArrowRight className="ml-2" size={15}/></a>
          </div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {[
              ["Freiwillige Einsätze von 2–4 Stunden","Jeder Einsatz hat eine klare Aufgabe, einen Ort und einen festen Zeitraum."],
              ["Erst nach dem Einsatz bezahlen","Für eine Registrierung, Einladung oder nicht erschienene Person fällt keine Vermittlungsgebühr an."],
              ["Bestätigte Teilnahme","An- und Abmeldung dokumentieren die Anwesenheit. Die Gebühr fällt erst an, wenn der Verein die tatsächlich geleistete Zeit bestätigt hat."],
              ["Anerkennung für alle","Bronze ab 20 bestätigten Stunden, Silber ab 40 und Gold ab 60 – mit einer von Hand unterschriebenen Gold-Urkunde."],
            ].map(([title,copy]) => <div key={title} className="py-6"><p className="font-black text-[#182237]"><Check size={14} className="mr-2 inline text-[#9a741c]"/>{title}</p><p className="mt-2 text-sm leading-6 text-[#667184]">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-black/[0.06]"><div className="shell grid gap-10 lg:grid-cols-2"><article className="panel p-8 sm:p-10"><p className="eyebrow">Durch Sponsoren finanzierte Einsätze</p><h2 className="mt-5 text-3xl font-black tracking-tight">Die Gebühr ist übernommen.<br/>Die Hilfe kommt im Verein an.</h2><p className="mt-5 text-base leading-8 text-[#667184]">Wähle ab 25 Stunden, die du unterstützen möchtest – auch über mehrere Vereine oder Einsätze hinweg. Vor der Rechnung vereinbaren wir Umfang, Preis, Zeitraum und den Umgang mit nicht geleisteten Stunden. Deine Anfrage allein finanziert noch keine Stunden. Das Angebot nennt die enthaltenen Gebühren und Kosten. Aus der Vermittlungsgebühr für Vereine ergibt sich kein Sponsoring-Stundenpreis.</p><a href="/sponsors" className="text-link mt-7">Mehr zum Sponsoring <ArrowRight size={15}/></a></article><article className="panel p-8 sm:p-10"><p className="eyebrow">Teameinsätze · bis zu acht Stunden</p><h2 className="mt-5 text-3xl font-black tracking-tight">Ein Angebot, das<br/>zu eurem Projekt passt.</h2><p className="mt-5 text-base leading-8 text-[#667184]">Für Teameinsätze erhältst du ein individuelles Angebot. Organisation, Material, Ausrüstung und weitere Kosten vereinbaren wir vorab. Die Vermittlungsgebühr von 10 € für einzelne freiwillige Einsätze ist kein Preis für einen ganzen Projekttag.</p><a href="/corporate" className="text-link mt-7">Teameinsatz planen <ArrowRight size={15}/></a></article></div></section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-20 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-2">
          <div><p className="eyebrow">Freiwillige</p><h2 className="premium-section mt-5">Für dich kostenlos.</h2><p className="mt-5 text-base leading-7 text-[#667184]">Du entscheidest selbst, bei welchem Einsatz du mithilfst. Du zahlst keine Teilnahmegebühr und verpflichtest dich zu keinen weiteren Einsätzen.</p></div>
          <div><p className="eyebrow">Versicherung &amp; Verantwortung</p><h2 className="premium-section mt-5">Der Verein bleibt verantwortlich.</h2><p className="mt-5 text-base leading-7 text-[#667184]">Der Verein bleibt für Betreuung, Schutz von Minderjährigen, geeignete Aufgaben, Sicherheit und erforderliche Versicherungen verantwortlich. Falls zusätzlicher Versicherungsschutz angeboten wird, siehst du Preis und Versicherungsbedingungen vor dem Abschluss.</p></div>
        </div>
      </section>
    </main>
  )
}
