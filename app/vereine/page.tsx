import type { Metadata } from 'next'
import { ArrowRight, Check, Clock3, HeartHandshake, Share2, Users } from 'lucide-react'
import { sportsEventTemplates } from '@/lib/sports-football-engine'

export const metadata: Metadata = {
  title: 'Für Vereine',
  description: 'RunYourEvent Club strukturiert Spieltage und Vereinsveranstaltungen und verwandelt offene Aufgaben in klare Helferschichten.',
  alternates: { canonical: '/vereine' },
}

export default function ClubsPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-black/[0.06] bg-[#fbfcf9] py-16 sm:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="club-eyebrow">RunYourEvent Club</p>
            <h1 className="club-section mt-4">Spieltag organisieren.<br />Helfer finden.</h1>
          </div>
          <div className="max-w-xl">
            <p className="text-lg leading-8 text-[#617067]">Ihr sagt RunYourEvent, was stattfindet. RYE baut den Ablauf, trennt Vereinsrollen von Helferaufgaben und macht offene Arbeit zu kurzen, klaren Schichten.</p>
            <a href="/vereine/spieltag-erstellen" className="btn-primary mt-7">Spieltag erstellen <ArrowRight className="ml-2" size={16} /></a>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell">
          <p className="club-eyebrow">Start mit fünf starken Eventtypen</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {sportsEventTemplates.map(template => (
              <article key={template.id} className="quiet-card">
                <h2 className="text-lg font-black tracking-[-0.03em] text-[#12251a]">{template.label}</h2>
                <p className="mt-3 text-sm leading-6 text-[#6a776d]">{template.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-black/[0.06] bg-[#f6f8f4]">
        <div className="shell grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="club-eyebrow">Was RYE übernimmt</p>
            <h2 className="club-section mt-4">Aus einem Event wird ein ausführbarer Plan.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Users, 'People Split', 'Welche Aufgaben bleiben bei Vereinsrollen? Welche eignen sich für Helfer?'],
              [Clock3, '2-Stunden-Prinzip', '2 Stunden sind der Standard. Längere Aufgaben werden geteilt; 4 Stunden sind das Maximum.'],
              [Share2, 'Helfer finden', 'Offene Schichten lassen sich per Link, QR, WhatsApp und Vereinskanälen teilen.'],
              [HeartHandshake, 'Anerkennung', 'Der Verein kann für jede Schicht ein passendes Dankeschön hinterlegen.'],
            ].map(([Icon, title, body]: any) => (
              <article key={title} className="quiet-card">
                <Icon size={21} className="text-[#25823d]" />
                <h3 className="mt-5 text-lg font-black text-[#12251a]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#68756c]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell rounded-[28px] border border-[#d9e6da] bg-[#f1f7f0] p-6 sm:p-9 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="club-eyebrow">Ein Paket</p>
            <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#102218]">200 € <span className="text-lg text-[#66746a]">/ Verein / Jahr</span></p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#56645a]">
              {['Event Engine', 'Helferschichten', 'Teilen & Erinnern', 'Check-in', 'Anerkennung'].map(item => <span key={item} className="inline-flex items-center gap-2"><Check size={15} className="text-[#25823d]" />{item}</span>)}
            </div>
          </div>
          <a href="/vereine/spieltag-erstellen" className="btn-primary mt-7 lg:mt-0">Demo-Spieltag erstellen <ArrowRight className="ml-2" size={16} /></a>
        </div>
      </section>
    </main>
  )
}
