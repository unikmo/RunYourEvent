'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'

export default function SeasonalNeedsForm() {
  const [state, setState] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [format, setFormat] = useState('community')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const values = Object.fromEntries(new FormData(form).entries())
    const volunteerCount = Number(values.volunteerCount)
    const hoursPerVolunteer = Number(values.hoursPerVolunteer)
    const materialsBudgetCents = Math.round(Number(values.materialsBudgetEuros || 0) * 100)
    if (!Number.isInteger(volunteerCount) || volunteerCount < 1 || volunteerCount > 500 || !Number.isInteger(hoursPerVolunteer) || hoursPerVolunteer < 2 || hoursPerVolunteer > (format === 'corporate' ? 8 : 4) || !Number.isInteger(materialsBudgetCents) || materialsBudgetCents < 0) {
      setState('error'); setMessage('Check the volunteer count, activity duration and materials budget.'); return
    }
    if (String(values.seasonEnd) < String(values.seasonStart) || (values.activityDate && (String(values.activityDate) < String(values.seasonStart) || String(values.activityDate) > String(values.seasonEnd)))) {
      setState('error'); setMessage('The activity date must fall within the season, and the end must follow the start.'); return
    }
    setState('sending'); setMessage('')
    try {
      const response = await fetch('/api/community', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...values, action:'seasonal_need', volunteerCount, hoursPerVolunteer, materialsBudgetCents, partialFunding:values.partialFunding === 'on', privacyAck:values.privacyAck === 'on'}) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Your need could not be submitted. Please try again.')
      setState('success'); setMessage('Your seasonal need is saved. Open your club workspace to publish activities and invite volunteers. Funding and recruitment are confirmed separately.'); form.reset(); setFormat('community')
    } catch (error) { setState('error'); setMessage(error instanceof Error ? error.message : 'Your need could not be submitted. Please try again.') }
  }

  return <form onSubmit={submit} className="mt-8 grid gap-6">
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <div className="grid gap-6 sm:grid-cols-2">
      <label><span className="label">Club / sports organization</span><input className="input" name="organizationName" required maxLength={160} autoComplete="organization" /></label>
      <label><span className="label">Contact person</span><input className="input" name="contactName" required maxLength={120} autoComplete="name" /></label>
      <label><span className="label">Contact email</span><input className="input" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label><span className="label">City</span><input className="input" name="city" required minLength={2} maxLength={120} autoComplete="address-level2" /></label>
    </div>
    <label><span className="label">What does your club need?</span><input className="input" name="title" required minLength={3} maxLength={160} placeholder="Youth tournament support or clubhouse painting" /></label>
    <label><span className="label">Describe the work and what it enables</span><textarea className="input min-h-32" name="description" required minLength={20} maxLength={3000} placeholder="Explain the tasks, who benefits and what a successful activity looks like. Public descriptions should not contain personal contact details." /></label>
    <fieldset className="border-y border-black/[0.08] py-6"><legend className="label">Season and activity</legend><div className="mt-4 grid gap-6 sm:grid-cols-2">
      <label><span className="label">Season starts</span><input className="input" name="seasonStart" type="date" required /></label>
      <label><span className="label">Season ends</span><input className="input" name="seasonEnd" type="date" required /></label>
      <label><span className="label">Fixed activity date · optional</span><input className="input" name="activityDate" type="date" /><span className="field-help">Leave blank for a flexible date within the season.</span></label>
      <label><span className="label">Activity format</span><select className="input" name="activityFormat" value={format} onChange={e=>setFormat(e.target.value)}><option value="community">Community activity · 2–4 hours</option><option value="corporate">Corporate team project · up to 8 hours</option></select></label>
      <label><span className="label">Volunteers needed</span><input className="input" name="volunteerCount" type="number" min={1} max={500} step={1} required /></label>
      <label><span className="label">Hours per volunteer</span><input key={format} className="input" name="hoursPerVolunteer" type="number" min={2} max={format==='corporate'?8:4} step={1} defaultValue={format==='corporate'?8:4} required /></label>
    </div><p className="field-help mt-4">Submit one entry per activity or repeatable role. Add further entries for other seasonal needs. Corporate project packages are quoted after review.</p></fieldset>
    <label><span className="label">Skills or qualifications · optional</span><textarea className="input min-h-24" name="skills" maxLength={1500} placeholder="Describe any qualifications, age restrictions or specialist work." /></label>
    <label><span className="label">Materials and equipment · optional</span><textarea className="input min-h-24" name="materials" maxLength={1500} placeholder="What will the club provide? What needs funding?" /></label>
    <label><span className="label">Materials budget (€) · optional</span><input className="input" name="materialsBudgetEuros" type="number" min={0} max={1000000} step={0.01} placeholder="e.g. 250" /><span className="field-help">An estimate, separate from platform fees and any project quote.</span></label>
    <label><span className="label">On-site supervision and safety</span><textarea className="input min-h-28" name="supervision" required minLength={10} maxLength={2000} placeholder="Explain who supervises, the briefing, equipment and any safeguarding or safety requirements. Specialist repairs must be handled by qualified people." /></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-[#5f6978]"><input name="partialFunding" type="checkbox" defaultChecked className="mt-1 h-4 w-4" /><span>Part sponsorship is useful. A sponsor may support part of this need, subject to an agreed allocation.</span></label>
    <label className="flex items-start gap-3 border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><input name="privacyAck" type="checkbox" required className="mt-1 h-4 w-4" /><span>I am authorized to submit this need and agree to publication of its activity details. Contact details remain private. I have read the <Link className="underline" href="/privacy">privacy notice</Link>. Submission does not guarantee funding or volunteers.</span></label>
    <div><button className="btn-primary" disabled={state==='sending'}>{state==='sending'?'Submitting…':'Submit seasonal need'}</button></div>
    {message && <p role={state==='error'?'alert':'status'} className={`text-sm leading-6 font-bold ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
    {state==='success'&&<Link href="/club" className="text-link">Open your club workspace →</Link>}
  </form>
}
