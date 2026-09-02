'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Check, Clock3, HeartHandshake, MapPin } from 'lucide-react'

const opportunities: Record<string, { title: string; time: string; duration: string; places: string; thanks: string }> = {
  'kids-challenge': { title: 'Kids Challenge helfen', time: '14:30–16:30', duration: '2 Stunden', places: '2 Plätze frei', thanks: 'Essen & Getränk' },
  verlosung: { title: 'Verlosung unterstützen', time: '15:00–16:30', duration: '1,5 Stunden', places: '1 Platz frei', thanks: 'Freikarte' },
  aufraeumen: { title: 'Aufräumen & Rückbau', time: '17:00–19:00', duration: '2 Stunden', places: '3 Plätze frei', thanks: 'Essen & Getränk' },
}

export default function HelperSignupPage() {
  const params = useParams<{ slug: string }>()
  const item = opportunities[params.slug] || opportunities['kids-challenge']
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [adult, setAdult] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <main className="min-h-[70vh] bg-[#f7faf6] py-16">
        <div className="shell max-w-2xl">
          <div className="panel p-7 text-center sm:p-10">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e7f5e8] text-[#25823d]"><Check size={24} /></span>
            <p className="club-eyebrow mt-6">Demo abgeschlossen</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[#14291c]">Danke, {name || 'Helfer'}.</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#66736a]">So würde die Bestätigung aussehen. In dieser Live-Demo wurden keine Daten gespeichert und keine Anmeldung an einen Verein gesendet.</p>
            <a href="/helfen" className="btn-secondary mt-7">Weitere Aufgaben ansehen</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7faf6] py-10 sm:py-14">
      <div className="shell grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="rounded-[24px] bg-[#102218] p-6 text-white sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#91d09e]">FC Musterstadt · Demo</p>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.045em]">{item.title}</h1>
          <div className="mt-7 space-y-3 text-sm font-bold text-white/72">
            <p className="flex items-center gap-2"><Clock3 size={16} className="text-[#91d09e]" />{item.time} · {item.duration}</p>
            <p className="flex items-center gap-2"><MapPin size={16} className="text-[#91d09e]" />Musterstadt</p>
            <p className="flex items-center gap-2"><HeartHandshake size={16} className="text-[#91d09e]" />Als Dank: {item.thanks}</p>
          </div>
          <p className="mt-6 inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80">{item.places}</p>
          <div className="mt-8 border-t border-white/10 pt-6 text-sm leading-6 text-white/58">Eine konkrete Aufgabe. Ein klarer Zeitraum. Vor Ort gibt es eine kurze Einweisung und einen benannten Vereinskontakt.</div>
        </aside>

        <section className="panel p-6 sm:p-8">
          <p className="club-eyebrow">Ich helfe mit</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-[#173020]">Nur das Nötigste.</h2>
          <div className="mt-7 space-y-5">
            <div><label className="label">Vorname</label><input className="input" value={name} onChange={e => setName(e.target.value.slice(0,80))} placeholder="Dein Vorname" /></div>
            <div><label className="label">E-Mail</label><input type="email" className="input" value={email} onChange={e => setEmail(e.target.value.slice(0,120))} placeholder="du@beispiel.de" /></div>
            <label className="flex items-start gap-3 rounded-xl border border-[#dce6dd] bg-[#f8fbf8] p-4 text-sm font-bold leading-6 text-[#5f6d63]"><input className="mt-1" type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} /><span>Ich bin mindestens 18 Jahre alt.</span></label>
            <button type="button" disabled={!name.trim() || !email.includes('@') || !adult} onClick={() => setDone(true)} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-45">Demo-Anmeldung bestätigen</button>
            <p className="text-xs leading-5 text-[#78857c]">Live-Demo: Deine Eingaben werden nicht gespeichert oder übertragen. Die produktive Helferanmeldung wird erst nach Freigabe der Datenschutz- und Schutzprozesse aktiviert.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
