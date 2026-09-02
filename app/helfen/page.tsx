import type { Metadata } from 'next'
import { ArrowRight, Clock3, HeartHandshake, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: '2 Stunden helfen',
  description: 'Finde eine konkrete Helferaufgabe bei einem Verein. Eine Aufgabe. Ein Termin. Ein klarer Zeitraum.',
  alternates: { canonical: '/helfen' },
}

const demoOpportunities = [
  { slug: 'kids-challenge', club: 'FC Musterstadt · Demo', title: 'Kids Challenge helfen', city: 'Musterstadt', time: '14:30–16:30', duration: '2 Stunden', places: '2 Plätze frei', thanks: 'Essen & Getränk' },
  { slug: 'verlosung', club: 'FC Musterstadt · Demo', title: 'Verlosung unterstützen', city: 'Musterstadt', time: '15:00–16:30', duration: '1,5 Stunden', places: '1 Platz frei', thanks: 'Freikarte' },
  { slug: 'aufraeumen', club: 'FC Musterstadt · Demo', title: 'Aufräumen & Rückbau', city: 'Musterstadt', time: '17:00–19:00', duration: '2 Stunden', places: '3 Plätze frei', thanks: 'Essen & Getränk' },
]

export default function HelpPage() {
  return (
    <main className="bg-[#f7faf6]">
      <section className="border-b border-black/[0.06] bg-white py-14 sm:py-18">
        <div className="shell grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="club-eyebrow">Für Helfer</p>
            <h1 className="club-section mt-4">2 Stunden helfen.<br />Fertig.</h1>
          </div>
          <div className="max-w-xl">
            <p className="text-lg leading-8 text-[#617067]">Keine Dauerverpflichtung. Such dir eine konkrete Aufgabe aus, hilf für einen klaren Zeitraum und entscheide danach selbst, ob du wieder helfen möchtest.</p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div><p className="club-eyebrow">Offene Aufgaben</p><h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[#14291c]">Demo-Schichten in Musterstadt</h2></div>
            <div className="rounded-xl border border-[#dce6dd] bg-white px-4 py-3 text-xs font-bold text-[#6f7c72]">Live-Demo · echte lokale Suche folgt nach Freigabe</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {demoOpportunities.map(item => (
              <article key={item.slug} className="quiet-card flex flex-col">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7d8a80]">{item.club}</p>
                <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-[#13271b]">{item.title}</h3>
                <div className="mt-5 space-y-2 text-sm font-bold text-[#647168]">
                  <p className="flex items-center gap-2"><Clock3 size={15} className="text-[#25823d]" />{item.time} · {item.duration}</p>
                  <p className="flex items-center gap-2"><MapPin size={15} className="text-[#25823d]" />{item.city}</p>
                  <p className="flex items-center gap-2"><HeartHandshake size={15} className="text-[#25823d]" />Als Dank: {item.thanks}</p>
                </div>
                <p className="mt-5 text-sm font-black text-[#25823d]">{item.places}</p>
                <a href={`/helfen/${item.slug}`} className="btn-primary mt-6 w-full">Ich helfe mit <ArrowRight className="ml-2" size={16} /></a>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[24px] border border-black/[0.06] bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div><h3 className="text-lg font-black text-[#15291c]">Noch nichts Passendes?</h3><p className="mt-2 text-sm leading-6 text-[#69766d]">Später kannst du Ort und Zeitraum speichern und dich nur informieren lassen, wenn eine passende 2-Stunden-Aufgabe auftaucht.</p></div>
            <span className="mt-4 inline-block rounded-full bg-[#eef3ee] px-3 py-1.5 text-xs font-black text-[#718076] sm:mt-0">Noch nicht aktiv</span>
          </div>
        </div>
      </section>
    </main>
  )
}
