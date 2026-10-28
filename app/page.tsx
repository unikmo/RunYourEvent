import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, Check, Clock3, GraduationCap, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = pageMetadata({
  title: "RunYourEvent | Hilf im Sportverein – allein oder mit deinem Team",
  description: "Finde einen freiwilligen Einsatz im Sportverein, bring dein Team mit oder finde Unterstützung für deinen Verein. Mit bestätigten Stunden und Sponsoring ab 25 Stunden.",
  alternates: { canonical: '/' },
})

const audiences = [
  ["Für Freiwillige", "Ein paar Stunden, die etwas bewegen.", "Finde einen Einsatz in deiner Nähe, bring Freunde mit und lass dir deine geleisteten Stunden bestätigen.", '/activities', "Einsatz finden"],
  ["Für Sportvereine", "Die Unterstützung, die dein Verein braucht.", "Finde Helfer für den nächsten Spieltag, ein Vereinsprojekt oder die ganze Saison.", '/club', "Freiwillige finden"],
  ["Für Unternehmen & Organisationen", "Gemeinsam anpacken – mit deinem Team.", "Gib deinem Team die Gelegenheit, gemeinsam etwas für einen Verein zu bewegen – für ein paar Stunden oder einen ganzen Tag.", '/corporate', "Teameinsätze entdecken"],
  ["Für Sponsoren", "Mach Engagement vor Ort möglich.", "Unterstütze einen oder mehrere Vereine ab 25 freiwillig geleisteten Stunden. Du erhältst ein Angebot und siehst später, welche Stunden tatsächlich bestätigt wurden.", '/opportunities', "Verein unterstützen"],
]
const steps = [
  ['01', "Vereine sagen, wo Hilfe gebraucht wird", "Aufgabe, Ort, Zeit und Anzahl der Helfer stehen vorher fest. Einzelne Einsätze dauern 2–4 Stunden, Teameinsätze bis zu acht Stunden."],
  ['02', "Du entscheidest, wo du mitmachst", "Du meldest dich selbst für einen Einsatz an und sprichst dich direkt mit dem Verein ab. Unternehmen laden ihre Mitarbeitenden über einen geschützten Teambereich ein."],
  ['03', "Deine geleisteten Stunden werden bestätigt", "Du meldest dich vor Ort an und nach dem Einsatz ab. Der Verein bestätigt deine tatsächlichen Stunden. Sie zählen für deine Anerkennung und erscheinen im Bericht."],
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section aria-labelledby="home-heading" className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative grid items-start gap-9 py-8 sm:gap-12 sm:py-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:py-14">
          <div>
            <p className="eyebrow">Gemeinsam für den Sport vor Ort.</p>
            <h1 id="home-heading" className="home-hero mt-4">Dein Verein.<br/><span className="text-[#9a741c]">Deine Hilfe zählt.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#646f80] sm:text-lg">Hilf bei einem Sportverein mit, bring dein Team mit oder finde Unterstützung für deinen Verein.</p>
            <div className="mt-6 flex flex-wrap gap-3" aria-label="So kannst du mitmachen">
              <a href="/activities" className="btn-primary">Einsatz finden <ArrowRight className="ml-2" size={16}/></a>
              <a href="/club" className="btn-secondary">Freiwillige finden</a>
              <a href="/corporate" className="btn-secondary">Mit deinem Team helfen</a>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#646f80]">Freiwillige Teameinsätze für Unternehmen und Organisationen. <a href="/sponsors" className="font-bold underline underline-offset-4">Du kannst Vereine auch als Sponsor unterstützen.</a></p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#646f80] sm:text-sm">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>Du entscheidest, wann du hilfst</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>Lass dir deine Stunden bestätigen</span>
            </div>
          </div>
          <aside aria-label="Beispiele für freiwillige Einsätze" className="space-y-3 lg:pt-1">
            <article className="rounded-3xl bg-[#0e1729] p-6 text-white sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#e7c66f]">Beispiel: freiwilliger Einsatz</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Mach den nächsten Spieltag möglich.</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">Begrüße Gäste, hilf bei der Turnierleitung oder pack beim Aufbau mit an.</p>
              <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/80"><span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-[#e7c66f]"/>2–4 Stunden</span><span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-[#e7c66f]"/>Bestätigte Stunden</span></div>
            </article>
            <article className="rounded-3xl border border-[#d5ad48]/35 bg-[#eee7d3] p-6 sm:p-7">
              <p className="eyebrow">Beispiel: Einsatz mit deinem Team</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Ein gemeinsamer Tag. Viel geschafft für den Verein.</h2>
              <p className="mt-3 text-sm leading-6 text-[#536072]">Streich mit deinen Kollegen das Vereinsheim oder bring den Vereinsgarten auf Vordermann. Aufgaben und Betreuung sind vorher geklärt. Eure geleisteten Stunden werden bestätigt.</p>
              <a href="/corporate" className="text-link mt-4"><Users size={16}/>Teameinsätze bis zu 8 Stunden <ArrowRight size={14}/></a>
            </article>
          </aside>
        </div>
      </section>

      <section aria-label="So kannst du mitmachen" className="border-b border-black/[0.06] bg-white py-10 sm:py-14">
        <div className="shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(([label,title,copy,href,cta])=><article key={label} className="flex flex-col border-t border-[#d5ad48] pt-5"><p className="eyebrow">{label}</p><h2 className="mt-3 text-xl font-black tracking-tight">{title}</h2><p className="mt-3 text-sm leading-7 text-[#667184]">{copy}</p><a className="text-link mt-5" href={href}>{cta}<ArrowRight size={14}/></a></article>)}</div>
      </section>

      <section id="how-it-works" className="bg-[#f7f5ef] py-14 sm:py-20">
        <div className="shell"><p className="eyebrow">So funktioniert’s</p><h2 className="premium-section mt-4 max-w-3xl">Wo dein Verein Hilfe braucht, kannst du etwas bewegen.</h2><div className="mt-9 grid gap-8 md:grid-cols-3">{steps.map(([n,title,copy])=><article key={n} className="border-t border-black/10 pt-5"><p className="eyebrow">{n}</p><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-[#667184]">{copy}</p></article>)}</div></div>
      </section>

      <section id="employee-volunteering" className="bg-[#0e1729] py-14 text-white sm:py-20">
        <div className="shell grid gap-9 lg:grid-cols-2 lg:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#e7c66f]">Für Unternehmen &amp; Organisationen</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-.04em] sm:text-4xl">Dein Team packt an.<br/>Der Verein hat die passende Aufgabe.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/70">Pack mit deinen Kollegen bei einem Vereinsprojekt an. Ob Vereinsheim streichen oder Garten pflegen: Gemeinsam helft ihr dort, wo ihr gebraucht werdet – bis zu acht Stunden lang.</p><a href="/corporate" className="btn-signal mt-6">Teameinsatz planen <ArrowRight size={16} className="ml-2"/></a></div><div className="divide-y divide-white/15 border-y border-white/15">{[["Eine klare Aufgabe","Klärt vor der Buchung die Aufgaben, Teamgröße, Betreuung, Materialien und den Preis."],["Alles für dein Team an einem Ort","Lade dein Team ein. Jeder bestätigt die Teilnahme selbst. Alle Absprachen bleiben im geschützten Teambereich."],["Bestätigte Teilnahme","Der Verein bestätigt die tatsächlich geleisteten Stunden. Sie erscheinen anschließend im Bericht für dein Unternehmen."]].map(([title,copy])=><div key={title} className="py-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-white/65">{copy}</p></div>)}</div></div>
      </section>

      <section id="fees-and-recognition" className="py-14 sm:py-20">
        <div className="shell grid items-start gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-black/[0.07] bg-white p-7 sm:p-9"><p className="eyebrow">Klare Gebühren für deinen Verein</p><h2 className="mt-4 text-4xl font-black tracking-tight">€10 <span className="text-base font-semibold tracking-normal text-[#667184]">pro Person nach bestätigtem Einsatz</span></h2><p className="mt-4 text-sm leading-7 text-[#667184]">Die Gebühr fällt erst an, wenn der Verein den abgeschlossenen Einsatz bestätigt hat. Ein zugeordnetes Sponsoring kann sie übernehmen.</p><div className="mt-5 divide-y divide-black/[0.07] border-y border-black/[0.07] text-sm text-[#536072]"><p className="py-3"><b>Ausschreiben, einladen und anmelden:</b> kostenlos</p><p className="py-3"><b>Nicht erschienen:</b> keine Vermittlungsgebühr</p><p className="py-3"><b>Teameinsätze von Unternehmen:</b> mit individuellem Angebot</p></div><p className="mt-4 text-xs leading-6 text-[#667184]">Kosten für Material, zusätzlichen Versicherungsschutz und gegebenenfalls Steuern werden separat ausgewiesen.</p><a href="/pricing" className="text-link mt-5">Preise ansehen <ArrowRight size={14}/></a></article>
          <article className="rounded-3xl bg-[#eee7d3] p-7 sm:p-9"><p className="eyebrow">Anerkennung für deinen Einsatz</p><GraduationCap className="mt-5 text-[#9a741c]" size={30}/><h2 className="mt-4 text-3xl font-black tracking-tight">Dein Engagement zählt – auch über den Einsatz hinaus.</h2><p className="mt-4 text-sm leading-7 text-[#536072]">Sammle bestätigte Stunden bei verschiedenen Vereinen und Einsätzen. Ab 20 Stunden erreichst du Bronze, ab 40 Silber und ab 60 Gold. Die Gold-Urkunde wird von Hand unterschrieben.</p><p className="mt-4 text-sm leading-7 text-[#536072]">Wenn du volljährig bist, kannst du dein Profil veröffentlichen und dich freiwillig im Champsboard mit anderen vergleichen – in deiner Stadt, deinem Land oder weltweit.</p><div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#536072]"><ShieldCheck size={17}/>Vor Ort anmelden, abmelden und vom Verein bestätigen lassen</div><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3"><a href="/recognition" className="text-link">Mehr zur Anerkennung <ArrowRight size={14}/></a><a href="/champsboard" className="text-link">Zum Champsboard <ArrowRight size={14}/></a></div></article>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white py-14 sm:py-20"><div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow">Dein Plan fürs Wochenende</p><h2 className="premium-section mt-4 max-w-3xl">Bring deine Freunde mit.<br/>Vier Stunden, die etwas bewegen.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-[#667184]">Such dir einen Einsatz aus und teile ihn mit deinen Freunden. So macht ihr gemeinsam etwas Sinnvolles. Jeder meldet sich selbst an und sammelt seine eigenen bestätigten Stunden.</p></div><a href="/activities" className="btn-primary">Einsatz finden <ArrowRight className="ml-2" size={16}/></a></div></section>
    </main>
  )
}
