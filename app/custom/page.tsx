'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Check, GitBranch, Layers3, Search, ShieldAlert, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calculateSuggestedStart } from '@/lib/dates'
import type { BudgetLevel, Event, SmartContext } from '@/types'

type Tier = 'essential' | 'professional'
type PreviewTask = { id?: string; title: string; workstream?: string; who?: string; target_date?: string; weeks_before_event?: number; critical_path?: boolean }

export default function CustomEventPage() {
  const [step,setStep] = useState(1)
  const [eventName,setEventName] = useState(''); const [eventDate,setEventDate] = useState(''); const [objective,setObjective] = useState('')
  const [guestCount,setGuestCount] = useState('250'); const [city,setCity] = useState(''); const [country,setCountry] = useState('')
  const [eventFormat,setEventFormat] = useState('indoor'); const [venueStatus,setVenueStatus] = useState('unknown'); const [teamSize,setTeamSize] = useState('4')
  const [budgetLevel,setBudgetLevel] = useState<BudgetLevel>(2); const [firstTime,setFirstTime] = useState(false)
  const [suggestions,setSuggestions] = useState<Event[]>([]); const [matchedEvent,setMatchedEvent] = useState<Event|null>(null)
  const [loading,setLoading] = useState(false); const [error,setError] = useState('')
  const [draftToken,setDraftToken] = useState(''); const [recommendedTier,setRecommendedTier] = useState<Tier>('essential')
  const [summary,setSummary] = useState<any>(null); const [previewTasks,setPreviewTasks] = useState<PreviewTask[]>([])
  const [acceptTerms,setAcceptTerms] = useState(false); const [immediate,setImmediate] = useState(false); const [checkoutLoading,setCheckoutLoading] = useState<Tier|null>(null)

  useEffect(() => {
    if (eventName.trim().length < 2) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase.rpc('search_events',{ query:eventName, cat:null }).limit(6)
      setSuggestions((data || []) as Event[])
    },250)
    return () => clearTimeout(timer)
  },[eventName])

  function eventProfile(): Event {
    const guests = Math.max(1,Number(guestCount)||250)
    const scale = guests < 50 ? 'Intimate' : guests < 500 ? 'Medium' : guests < 5000 ? 'Large' : 'Mega'
    return matchedEvent ? { ...matchedEvent, scale, description:`${matchedEvent.description || matchedEvent.name}. ${objective}`.trim() } : {
      id:'custom', name:eventName || 'Custom event', category:'Professional Event', subcategory:'Custom', scale,
      blueprint:'Event Execution Graph', luxury_base:budgetLevel, complexity:4, planning_weeks:12,
      description:`${eventName || 'Professional event'} for approximately ${guests} attendees. ${objective}`.trim(),
      key_dimensions:['venue and logistics','program and content','guest experience','production','communications','risk and contingency'],
      primary_cost:'Venue, production and event operations', key_risks:[], intake_questions:[], has_tasks:false,
    }
  }

  async function generate() {
    if (!eventName.trim() || !eventDate || !objective.trim()) return
    setLoading(true); setError(''); setStep(3)
    const event = eventProfile(); const start = calculateSuggestedStart(eventDate,event.planning_weeks || 12)
    const smart: SmartContext = { city:city||undefined,country:country||undefined,spendType:budgetLevel===0?'volunteer':'unknown',eventDate,planningStart:start }
    const intake = { guest_count:Math.max(1,Number(guestCount)||250), budget_level:budgetLevel, is_first_time:firstTime, is_volunteer_driven:budgetLevel===0, is_outdoor:eventFormat==='outdoor'||eventFormat==='mixed', custom_answers:{ objective,format:eventFormat,venue_status:venueStatus,team_size:teamSize } }
    try {
      const response = await fetch('/api/generate',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,intake,smart}) })
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not generate preview.')
      setDraftToken(data.draftToken); setRecommendedTier(data.recommendedTier); setSummary(data.summary); setPreviewTasks(data.previewTasks || [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not generate preview.') } finally { setLoading(false) }
  }

  async function checkout(tier:Tier) {
    if (!acceptTerms || !immediate) { setError('Please accept the Terms and request immediate digital delivery before checkout.'); return }
    setCheckoutLoading(tier); setError('')
    try {
      const response = await fetch('/api/checkout',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({draftToken,tier,acceptTerms,immediatePerformance:immediate}) })
      const data = await response.json(); if (!response.ok || !data.url) throw new Error(data.error || 'Checkout could not be started.')
      window.location.href = data.url
    } catch(e) { setError(e instanceof Error ? e.message : 'Checkout could not be started.'); setCheckoutLoading(null) }
  }

  return <main className="min-h-screen bg-[#f5f2ea]">
    <div className="shell py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap gap-2 text-xs font-black">{['Event brief','Operating context','Preview + unlock'].map((label,i)=><span key={label} className={`rounded-full px-4 py-2 ${step===i+1?'bg-[#15233f] text-white':step>i+1?'bg-[#e9e2ce] text-[#80631f]':'bg-white text-[#929aa6]'}`}>{step>i+1?'✓ ':''}{label}</span>)}</div>
      {step<3 && <div className="mb-8 max-w-3xl"><p className="eyebrow">Build an event execution plan</p><h2 className="page-title mt-4">Start with the outcome and the fixed date.</h2><p className="mt-4 text-[#6d7889]">RunYourEvent models prerequisites, dependencies, owners, backward timing, approvals, risks and completion criteria around the event that actually has to happen.</p></div>}

      {step===1 && <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="panel p-6 sm:p-8"><h3 className="text-lg font-black text-[#23324a]">Event brief</h3><div className="mt-6 space-y-5">
          <div className="relative"><label className="label">Event type or working name</label><Search size={16} className="absolute left-4 top-[46px] text-[#9ca4b0]"/><input className="input pl-11" value={eventName} onChange={e=>{setEventName(e.target.value.slice(0,120));setMatchedEvent(null)}} placeholder="e.g. European Customer Conference"/>{suggestions.length>0 && <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-xl">{suggestions.map(ev=><button key={ev.id} className="block w-full border-b px-4 py-3 text-left text-sm hover:bg-[#fbfaf7]" onClick={()=>{setMatchedEvent(ev);setEventName(ev.name);setSuggestions([])}}>{ev.name}<span className="ml-2 text-xs text-[#9a7b31]">{ev.category}</span></button>)}</div>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">Fixed event date</label><input type="date" className="input" value={eventDate} onChange={e=>setEventDate(e.target.value)}/></div><div><label className="label">Expected attendees</label><input type="number" min="1" className="input" value={guestCount} onChange={e=>setGuestCount(e.target.value)}/></div></div>
          <div><label className="label">What must this event achieve?</label><textarea className="input min-h-32" value={objective} onChange={e=>setObjective(e.target.value.slice(0,1200))} placeholder="Business objective, audience outcome, decision or experience that defines success."/></div>
          <button className="btn-primary" disabled={!eventName.trim()||!eventDate||!objective.trim()} onClick={()=>setStep(2)}>Add operating context <ArrowRight className="ml-2" size={15}/></button>
        </div></section>
        <aside className="rounded-2xl bg-[#15233f] p-6 text-white"><Sparkles className="text-[#efcd6d]"/><h3 className="mt-4 text-2xl font-black">Not a checklist. An operating model.</h3><div className="mt-6 space-y-4 text-sm text-white/70"><p>Dependencies: what must happen first and what gets blocked.</p><p>Backward timing: dates anchored to event day.</p><p>Approval and completion gates: who signs off and what proves done.</p><p>Risk: consequence of delay and contingency.</p></div></aside>
      </div>}

      {step===2 && <section className="panel max-w-4xl p-6 sm:p-8"><h3 className="text-lg font-black text-[#23324a]">Operating context</h3><div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><label className="label">City</label><input className="input" value={city} onChange={e=>setCity(e.target.value)}/></div><div><label className="label">Country</label><input className="input" value={country} onChange={e=>setCountry(e.target.value)}/></div>
        <div><label className="label">Format</label><select className="input" value={eventFormat} onChange={e=>setEventFormat(e.target.value)}><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="mixed">Mixed</option><option value="hybrid">Hybrid</option></select></div>
        <div><label className="label">Venue status</label><select className="input" value={venueStatus} onChange={e=>setVenueStatus(e.target.value)}><option value="confirmed">Confirmed</option><option value="shortlist">Shortlist</option><option value="searching">Searching</option><option value="unknown">Not decided</option></select></div>
        <div><label className="label">Core team size</label><input type="number" min="1" className="input" value={teamSize} onChange={e=>setTeamSize(e.target.value)}/></div>
        <div><label className="label">Operating level</label><select className="input" value={budgetLevel} onChange={e=>setBudgetLevel(Number(e.target.value) as BudgetLevel)}><option value="0">Volunteer-led</option><option value="1">Lean</option><option value="2">Balanced</option><option value="3">Premium</option><option value="4">Luxury</option><option value="5">Best available</option></select></div>
      </div><label className="mt-6 flex items-center gap-3 text-sm font-bold text-[#5f6d80]"><input type="checkbox" checked={firstTime} onChange={e=>setFirstTime(e.target.checked)}/>This team is delivering this event format for the first time.</label><div className="mt-7 flex gap-3"><button className="btn-secondary" onClick={()=>setStep(1)}>Back</button><button className="btn-primary" onClick={generate}>Generate free preview <ArrowRight className="ml-2" size={15}/></button></div></section>}

      {step===3 && <div>{loading ? <div className="panel p-12 text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#e8e4da] border-t-[#9d7c2f]"/><p className="mt-4 font-bold text-[#788395]">Building the event operating model…</p></div> : error && !draftToken ? <div className="panel p-8"><p className="font-black text-red-700">{error}</p><button className="btn-secondary mt-5" onClick={()=>setStep(2)}>Back</button></div> : draftToken && <>
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]"><section className="panel overflow-hidden"><div className="bg-[#15233f] p-6 text-white"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#efcd6d]">Free execution preview</p><h2 className="page-title mt-2">{eventName}</h2><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">{[['Tasks',summary?.taskCount],['Workstreams',summary?.workstreamCount],['Approvals',summary?.approvals],['High risks',summary?.highRisks],['Critical path',summary?.criticalPath]].map(([l,v])=><div key={String(l)} className="rounded-xl bg-white/10 p-3"><p className="text-[9px] uppercase text-white/70">{l}</p><p className="mt-1 text-lg font-black">{v}</p></div>)}</div></div><div className="divide-y divide-black/[.055]">{previewTasks.map((t,i)=><article key={t.id||i} className="p-5"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2e7c7] text-[#80631f]"><GitBranch size={15}/></span><div><p className="text-xs font-black uppercase tracking-[.1em] text-[#9a7b31]">{t.workstream||'Event Operations'}</p><h3 className="mt-1 font-black text-[#23324a]">{t.title}</h3><p className="mt-1 text-xs text-[#7a8595]">{t.who||'Event team'} · {t.target_date || (t.weeks_before_event!=null?`${t.weeks_before_event} weeks before event`:'sequence-driven')}{t.critical_path?' · critical path':''}</p></div></div></article>)}</div><div className="bg-[#fbf7ea] p-5 text-sm text-[#80631f]">The preview proves the structure. Purchase unlocks the complete right-sized plan; RunYourEvent does not hide necessary tasks merely to force an upgrade.</div></section>
          <aside className="space-y-4"><div className="rounded-2xl border border-[#c9aa57] bg-white p-6"><p className="text-[10px] font-black uppercase tracking-[.13em] text-[#9a7b31]">Recommended</p><h3 className="mt-2 text-xl font-black text-[#23324a]">{recommendedTier==='professional'?'Professional · $39':'Essential · $19'}</h3><p className="mt-3 text-sm leading-6 text-[#6d7889]">{recommendedTier==='professional'?'Your event has enough dependency, approval, risk or scale complexity to benefit from the deeper control layer.':'Your event appears straightforward enough for a complete Essential execution plan.'}</p></div>
          <div className="rounded-2xl bg-[#15233f] p-6 text-white"><label className="flex items-start gap-3 text-xs leading-5 text-white/65"><input className="mt-1" type="checkbox" checked={acceptTerms} onChange={e=>setAcceptTerms(e.target.checked)}/><span>I accept the <a className="underline" href="/terms" target="_blank">Terms</a> and <a className="underline" href="/privacy" target="_blank">Privacy Policy</a>.</span></label><label className="mt-4 flex items-start gap-3 text-xs leading-5 text-white/65"><input className="mt-1" type="checkbox" checked={immediate} onChange={e=>setImmediate(e.target.checked)}/><span>I expressly request immediate delivery of the digital plan before the withdrawal period ends and acknowledge the consequences described in the Terms.</span></label>{error && <p className="mt-4 text-xs font-bold text-red-300">{error}</p>}<button className="btn-signal mt-5 w-full" disabled={!!checkoutLoading} onClick={()=>checkout(recommendedTier)}>{checkoutLoading?'Opening secure checkout…':`Unlock ${recommendedTier==='professional'?'Professional · $39':'Essential · $19'} →`}</button><button className="mt-3 w-full text-center text-xs font-bold text-white/70" onClick={()=>checkout(recommendedTier==='professional'?'essential':'professional')}>Choose {recommendedTier==='professional'?'Essential · $19':'Professional · $39'} instead</button></div></aside>
        </div></>}</div>}
    </div>
  </main>
}
