'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, Clock3, Share2, ShieldCheck, Users } from 'lucide-react'
import { buildSportsEventPlan, sportsEventTemplates, type SportsEventType } from '@/lib/sports-football-engine'

export default function CreateMatchdayPage() {
  const [eventType, setEventType] = useState<SportsEventType>('heimspiel')
  const [kickoff, setKickoff] = useState('15:00')
  const [club, setClub] = useState('FC Musterstadt')
  const [date, setDate] = useState('')
  const [expectedVisitors, setExpectedVisitors] = useState('250')
  const [showPlan, setShowPlan] = useState(false)

  const visitorCount = Math.min(50000, Math.max(1, Number(expectedVisitors) || 250))
  const plan = useMemo(() => buildSportsEventPlan(eventType, kickoff, visitorCount), [eventType, kickoff, visitorCount])

  return (
    <main className="min-h-screen bg-[#f7faf6]">
      <div className="shell py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><p className="club-eyebrow">Sports & Football Event Engine</p><h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-[#102218] sm:text-5xl">Spieltag erstellen</h1></div>
          <span className="rounded-full border border-[#dbe6dc] bg-white px-3 py-1.5 text-xs font-black text-[#6a786e]">Live-Demo</span>
        </div>

        {!showPlan ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <section className="panel p-6 sm:p-8">
              <h2 className="text-xl font-black tracking-[-0.03em] text-[#183021]">Was plant ihr?</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Eventtyp</label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {sportsEventTemplates.map(template => (
                      <button key={template.id} type="button" onClick={() => setEventType(template.id)} className={`rounded-xl border p-4 text-left transition ${eventType === template.id ? 'border-[#25823d] bg-[#eef7ef]' : 'border-[#dfe7df] bg-white hover:border-[#b8c9bb]'}`}>
                        <span className="block font-black text-[#183021]">{template.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#718077]">{template.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="label">Verein</label><input className="input" value={club} onChange={e => setClub(e.target.value.slice(0,100))} /></div>
                <div><label className="label">Datum</label><input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div>
                  <label className="label">Erwartete Besucher / Zuschauer</label>
                  <input type="number" min="1" max="50000" step="10" className="input" value={expectedVisitors} onChange={e => setExpectedVisitors(e.target.value)} />
                  <p className="field-help">RYE nutzt die Schätzung, um publikumsnahe Helferaufgaben und Helferzahlen zu skalieren.</p>
                </div>
                <div><label className="label">Anpfiff / Start</label><input type="time" className="input" value={kickoff} onChange={e => setKickoff(e.target.value)} /></div>
              </div>
              <button type="button" className="btn-primary mt-8" onClick={() => setShowPlan(true)}>Event aufteilen <ArrowRight className="ml-2" size={16} /></button>
              <p className="mt-4 text-xs leading-5 text-[#7a877e]">Demo: Es werden keine Vereins- oder Helferdaten gespeichert.</p>
            </section>

            <aside className="rounded-[24px] bg-[#102218] p-6 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#91d09e]">RYE-Regeln</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">Kurze Aufgaben statt Dauerverpflichtung.</h2>
              <div className="mt-7 space-y-5 text-sm leading-6 text-white/66">
                <p className="flex gap-3"><Users size={18} className="mt-0.5 shrink-0 text-[#91d09e]" />Besucherzahl skaliert Empfang, Verpflegung, Aktivitäten, Aufräumen und andere publikumsnahe Aufgaben.</p>
                <p className="flex gap-3"><Clock3 size={18} className="mt-0.5 shrink-0 text-[#91d09e]" />2 Stunden sind der Standard. 4 Stunden sind das Maximum.</p>
                <p className="flex gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#91d09e]" />Sicherheits- und verantwortliche Clubrollen werden nicht automatisch aus einer Besucherformel abgeleitet.</p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <section className="panel overflow-hidden">
              <div className="border-b border-black/[0.06] bg-[#102218] p-6 text-white sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#91d09e]">{plan.eventLabel}</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">{club || 'Euer Verein'} · {kickoff} Uhr</h2>
                <p className="mt-2 text-sm font-bold text-white/58">{plan.expectedVisitors.toLocaleString('de-DE')} Besucher erwartet · {plan.attendanceBand}</p>
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    [String(plan.tasks.length), 'Aufgaben'],
                    [String(plan.clubTaskCount), 'Clubrollen'],
                    [String(plan.helperShiftCount), 'Helferschichten'],
                    [`${plan.maxShiftHours}h`, 'max. Schicht'],
                  ].map(([value, label]) => <div key={label} className="rounded-xl bg-white/10 p-3"><p className="text-xl font-black">{value}</p><p className="mt-1 text-[10px] font-bold text-white/48">{label}</p></div>)}
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-black text-[#173020]">Offene Helferschichten</h3><span className="text-xs font-bold text-[#6d7b71]">{plan.publicShiftCount} öffentlich teilbar</span></div>
                <div className="mt-4 divide-y divide-black/[0.06] border-y border-black/[0.06]">
                  {plan.shifts.slice(0, 10).map(shift => (
                    <article key={shift.shiftId} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><h4 className="font-black text-[#183021]">{shift.title}{shift.shiftIndex > 1 ? ` · Schicht ${shift.shiftIndex}` : ''}</h4><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${shift.volunteerClass === 'open' ? 'bg-[#e7f5e8] text-[#237338]' : 'bg-[#eef1ee] text-[#657169]'}`}>{shift.volunteerClass === 'open' ? 'offen' : 'mit Vereinsaufsicht'}</span></div>
                        <p className="mt-1 text-xs text-[#738077]">{shift.phase} · {shift.startTime}–{shift.endTime} · {shift.durationHours.toFixed(shift.durationHours % 1 ? 1 : 0)} Std. · {shift.helperCount} Helfer</p>
                        {shift.recognition && <p className="mt-1 text-xs font-bold text-[#25823d]">Als Dank: {shift.recognition}</p>}
                      </div>
                      <span className="text-xs font-bold text-[#7b887f]">{shift.briefing}</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="quiet-card">
                <p className="club-eyebrow">Ergebnis</p>
                <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-[#173020]">Der Plan ist geteilt.</h3>
                <div className="mt-5 space-y-3 text-sm font-bold text-[#617067]">
                  <p className="flex items-center gap-2"><Check size={15} className="text-[#25823d]" />Helferbedarf auf {plan.expectedVisitors.toLocaleString('de-DE')} Besucher skaliert</p>
                  <p className="flex items-center gap-2"><Check size={15} className="text-[#25823d]" />Clubrollen geschützt</p>
                  <p className="flex items-center gap-2"><Check size={15} className="text-[#25823d]" />Lange Aufgaben automatisch geteilt</p>
                  <p className="flex items-center gap-2"><Check size={15} className="text-[#25823d]" />Anerkennung je Schicht hinterlegt</p>
                </div>
                <a href="/helfen" className="btn-primary mt-6 w-full">Schichten ansehen <Share2 className="ml-2" size={16} /></a>
              </div>
              <button type="button" onClick={() => setShowPlan(false)} className="btn-secondary w-full">Event ändern</button>
              <p className="px-2 text-xs leading-5 text-[#7a877e]">Live-Demo: Teilen, Einladungen und echte Anmeldungen werden in dieser Phase noch nicht gespeichert.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
