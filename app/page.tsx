import type { Metadata } from 'next'
import { ArrowRight, CalendarDays, Check, ClipboardCheck, Clock3, HeartHandshake, QrCode, Share2, Sparkles, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RunYourEvent | Spieltage planen. Helfer finden.',
  description: 'RunYourEvent plant euren Spieltag, teilt Aufgaben auf und macht offene Aufgaben zu klaren Helferschichten. 2 Stunden helfen. Fertig.',
  alternates: { canonical: '/' },
}

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RunYourEvent Club',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://runyourevent.com',
  inLanguage: 'de-DE',
  description: 'Event- und Helferorganisation für Sportvereine: Spieltage strukturieren, Aufgaben verteilen und Helferschichten teilen.',
  offers: { '@type': 'Offer', price: '200', priceCurrency: 'EUR', category: 'Jahreszugang' },
}

const helperCards = [
  { title: 'Kids Challenge', time: '14:30–16:30', places: '2 Plätze frei', thanks: 'Essen & Getränk' },
  { title: 'Verlosung', time: '15:00–16:30', places: '1 Platz frei', thanks: 'Freikarte' },
  { title: 'Aufräumen', time: '17:00–19:00', places: '3 Plätze frei', thanks: 'Essen & Getränk' },
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative border-b border-black/[0.06] bg-[#fbfcf9]">
        <div className="club-halo" aria-hidden="true" />
        <div className="shell relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
          <div className="max-w-2xl">
            <p className="club-eyebrow">Für Sportvereine</p>
            <h1 className="club-hero mt-5">Dein Spieltag.<br /><span>Alle Aufgaben.<br />Alle Helfer.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f6c63]">RunYourEvent plant euren Spieltag, teilt Aufgaben auf und macht offene Aufgaben zu einfachen Helferschichten.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/vereine/spieltag-erstellen" className="btn-primary">Spieltag erstellen <ArrowRight className="ml-2" size={16} /></a>
              <a href="/helfen" className="btn-secondary">2 Stunden helfen</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#647168]">
              {['2 Stunden als Standard', 'max. 4 Stunden pro Helferschicht', '200 € / Verein / Jahr'].map(item => (
                <span key={item} className="inline-flex items-center gap-2"><Check size={15} className="text-[#25823d]" />{item}</span>
              ))}
            </div>
          </div>

          <div className="club-demo-card" aria-label="Beispiel eines organisierten Heimspiels">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6d7a70]">Beispiel-Heimspiel</p>
                <p className="mt-1 text-xl font-black tracking-[-0.03em] text-[#102218]">FC Musterstadt · Samstag 15:00</p>
              </div>
              <span className="rounded-full bg-[#e7f5e8] px-3 py-1.5 text-xs font-black text-[#237338]">75% gefüllt</span>
            </div>
            <div className="grid grid-cols-3 border-b border-black/[0.06] bg-[#f7faf6]">
              {[
                ['23', 'Aufgaben'],
                ['8', 'Helferschichten'],
                ['6', 'besetzt'],
              ].map(([value, label]) => (
                <div key={label} className="border-r border-black/[0.06] p-4 last:border-r-0 sm:p-5">
                  <p className="text-2xl font-black tracking-[-0.04em] text-[#102218]">{value}</p>
                  <p className="mt-1 text-[11px] font-bold text-[#748078]">{label}</p>
                </div>
              ))}
            </div>
            <div className="divide-y divide-black/[0.06] p-2 sm:p-3">
              {[
                ['Familien willkommen', '14:15–16:15', 'Voll'],
                ['Kids Challenge', '14:30–16:30', '1 frei'],
                ['Verlosung', '15:00–16:30', '1 frei'],
                ['Aufräumen', '17:00–19:00', '3 frei'],
              ].map(([task, time, status]) => (
                <div key={task} className="grid grid-cols-[1fr_auto] items-center gap-4 px-3 py-3.5">
                  <div><p className="font-extrabold text-[#17271d]">{task}</p><p className="mt-0.5 text-xs text-[#7a867d]">{time}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${status === 'Voll' ? 'bg-[#edf1ed] text-[#68736a]' : 'bg-[#fff2da] text-[#8a5b0b]'}`}>{status}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] p-5 sm:p-6">
              <p className="text-sm font-bold text-[#627067]">Offene Schichten direkt per WhatsApp oder QR teilen.</p>
              <Share2 size={18} className="shrink-0 text-[#25823d]" />
            </div>
          </div>
        </div>
      </section>

      <section id="so-funktionierts" className="section-pad bg-white">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="club-eyebrow">Ein Event. Drei Schritte.</p>
            <h2 className="club-section mt-4">Weniger organisieren.<br />Mehr Spieltag.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              [CalendarDays, '1', 'Event auswählen', 'Heimspiel, Familien-Spieltag, Jugendturnier, Vereinsfest oder Sponsorenspieltag.'],
              [ClipboardCheck, '2', 'RYE teilt es auf', 'Aufgaben, Zeiten und Verantwortliche werden zu einem klaren Ablauf.'],
              [Users, '3', 'Offene Schichten teilen', 'Helfer sehen eine konkrete Aufgabe, einen Termin und einen klaren Zeitraum.'],
            ].map(([Icon, number, title, body]: any) => (
              <article key={title} className="quiet-card">
                <div className="flex items-center justify-between"><Icon size={21} className="text-[#25823d]" /><span className="text-xs font-black text-[#93a097]">{number}</span></div>
                <h3 className="mt-7 text-xl font-black tracking-[-0.03em] text-[#12251a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#68756c]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-black/[0.06] bg-[#f6f8f4]">
        <div className="shell grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div className="max-w-md">
            <p className="club-eyebrow">Für Helfer</p>
            <h2 className="club-section mt-4">2 Stunden helfen.<br />Fertig.</h2>
            <p className="mt-5 text-base leading-7 text-[#637067]">Keine Dauerverpflichtung. Eine Aufgabe. Ein Termin. Ein klarer Zeitraum. Längere Aufgaben teilt RunYourEvent in Schichten; vier Stunden sind das Maximum.</p>
            <a href="/helfen" className="btn-primary mt-7">Offene Aufgaben ansehen <ArrowRight className="ml-2" size={16} /></a>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {helperCards.map(card => (
              <article key={card.title} className="rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_18px_45px_rgba(22,50,31,0.05)]">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7e8a81]">FC Musterstadt · Demo</p>
                <h3 className="mt-5 text-lg font-black tracking-[-0.025em] text-[#11231a]">{card.title}</h3>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#657269]"><Clock3 size={15} className="text-[#25823d]" />{card.time}</p>
                <p className="mt-4 text-sm font-black text-[#25823d]">{card.places}</p>
                <div className="mt-5 border-t border-black/[0.06] pt-4 text-xs font-bold text-[#758178]"><HeartHandshake size={15} className="mr-2 inline text-[#25823d]" />Als Dank: {card.thanks}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="club-eyebrow">Die Logik bleibt im Hintergrund</p>
            <h2 className="club-section mt-4">RunYourEvent kennt den Ablauf.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#647168]">Der Verein wählt das Event. RYE erkennt typische Phasen, trennt Vereinsrollen von Helferaufgaben und optimiert offene Arbeit auf kurze, klare Schichten.</p>
          </div>
          <div className="mt-12 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [Sparkles, 'Typische Abläufe', 'Heimspiel, Turnier, Familien- und Sponsorenspieltag.'],
              [ClipboardCheck, 'Klare Aufgaben', 'Jede Aufgabe bekommt Zeit, Rolle und Einweisung.'],
              [Clock3, '2-Stunden-Prinzip', 'Standard 2 Stunden. Maximal 4 Stunden.'],
              [QrCode, 'Einfach teilen', 'WhatsApp, QR und direkter Link.'],
              [HeartHandshake, 'Anerkennung', 'Der Verein kann Essen, Ticket oder Dankeschön hinterlegen.'],
            ].map(([Icon, title, body]: any) => (
              <div key={title} className="px-4 text-center lg:border-r lg:border-black/[0.06] lg:last:border-r-0">
                <Icon size={23} className="mx-auto text-[#25823d]" />
                <h3 className="mt-4 font-black tracking-[-0.02em] text-[#15271c]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b776e]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preis" className="pb-20 sm:pb-24 lg:pb-28">
        <div className="shell">
          <div className="rounded-[28px] border border-[#d9e6da] bg-[#f1f7f0] p-6 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="club-eyebrow">RunYourEvent Club</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#102218] sm:text-4xl">200 € <span className="text-lg text-[#66746a]">/ Verein / Jahr</span></h2>
              <div className="mt-5 grid gap-x-8 gap-y-2 text-sm font-bold text-[#536159] sm:grid-cols-2">
                {['Sport- & Fußball-Event Engine', 'Event- und Aufgabenplanung', 'Helferschichten bis max. 4 Std.', 'Helfer finden & teilen', 'Check-in & Abschluss', 'Anerkennung & Helferhistorie'].map(item => <span key={item} className="inline-flex items-center gap-2"><Check size={15} className="text-[#25823d]" />{item}</span>)}
              </div>
            </div>
            <div className="mt-7 shrink-0 lg:mt-0">
              <a href="/vereine/spieltag-erstellen" className="btn-primary w-full sm:w-auto">Spieltag erstellen <ArrowRight className="ml-2" size={16} /></a>
              <p className="mt-3 text-center text-xs font-semibold text-[#77837a]">Live-Demo · kein Produktionskauf</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
