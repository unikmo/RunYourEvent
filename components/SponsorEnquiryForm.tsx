'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

export default function SponsorEnquiryForm({needId: initialNeedId = '',mode='sponsorship'}:{needId?:string;mode?:'sponsorship'|'employee_project'}) {
  const employee=mode==='employee_project'
  const [needId, setNeedId] = useState(initialNeedId)
  const [hours,setHours]=useState('25')
  const [state, setState] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  useEffect(()=>{const q=new URLSearchParams(window.location.search);if(!initialNeedId)setNeedId(q.get('need')||'');const h=Number(q.get('hours'));if(Number.isSafeInteger(h)&&h>=25&&h<=1000000)setHours(String(h))},[initialNeedId])
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget
    if (!form.reportValidity()) return
    const values=Object.fromEntries(new FormData(form).entries())
    const requestedHours=Number(hours)
    if(!employee&&(!Number.isSafeInteger(requestedHours)||requestedHours<25||requestedHours>1000000)){setState('error');setMessage('Choose at least 25 whole volunteer-hours.');return}
    const budgetCents=values.budgetEuros === '' ? null : Math.round(Number(values.budgetEuros) * 100)
    if (budgetCents !== null && (!Number.isInteger(budgetCents) || budgetCents < 1 || budgetCents > 100000000)) {setState('error');setMessage('Enter a positive budget in euros, or leave it blank.');return}
    setState('sending');setMessage('')
    try {
      const response=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,action:'sponsor_enquiry',needId:needId||null,enquiryType:mode,requestedHours:employee?null:requestedHours,teamSize:employee?Number(values.teamSize):undefined,hoursPerEmployee:employee?Number(values.hoursPerEmployee):undefined,budgetCents,privacyAck:values.privacyAck==='on'})})
      const result=await response.json()
      if (!response.ok) throw new Error(result.error||'Your enquiry could not be submitted. Please try again.')
      setState('success');setMessage(employee?'Your employee-project enquiry has been recorded. Scope, safe team capacity, price and delivery arrangements must be agreed before invoicing or invitations.':`Your requested ${requestedHours} volunteer-hours have been recorded for a quote. No hours are funded or guaranteed yet. Scope, price, delivery dates and treatment of undelivered hours are agreed before invoicing.`);form.reset()
    } catch(error) {setState('error');setMessage(error instanceof Error?error.message:'Your enquiry could not be submitted. Please try again.')}
  }
  return <form onSubmit={submit} className="mt-8 grid gap-6">
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    {needId&&<div className="rounded-lg bg-[#f7f5ef] p-4 text-sm leading-6">{employee?'This enquiry is linked to a club project.':'This enquiry is linked to a club need. If it needs fewer than 25 hours, your package can include other suitable needs.'} <button type="button" className="underline" onClick={()=>setNeedId('')}>Enquire about a broader campaign instead</button></div>}
    {employee?<fieldset className="grid gap-5 rounded-xl border border-[#ded9cf] p-5 sm:grid-cols-2"><legend className="px-2 text-lg font-black">Your employee team</legend><label><span className="label">Employees · indicative team size</span><input className="input" name="teamSize" type="number" min={1} max={500} step={1} required defaultValue={10}/></label><label><span className="label">Activity hours per employee</span><input className="input" name="hoursPerEmployee" type="number" min={2} max={8} step={1} required defaultValue={4}/></label><p className="text-xs leading-6 text-[#667184] sm:col-span-2">Your employees supply the volunteering time. This enquiry is for a scoped team project, not community-hour sponsorship. Team capacity, breaks and actual credited time are agreed before booking.</p></fieldset>:<fieldset className="rounded-xl border border-[#ded9cf] p-5"><legend className="px-2 text-lg font-black">How many volunteer-hours would you like to sponsor?</legend><div className="mt-2 flex flex-wrap gap-3">{[25,50,100,250].map(h=><button type="button" className={Number(hours)===h?'btn-primary':'btn-secondary'} key={h} aria-pressed={Number(hours)===h} onClick={()=>setHours(String(h))}>{h} hours</button>)}</div><label className="mt-5 block"><span className="label">Your hour target · minimum 25</span><input name="requestedHours" className="input" type="number" min={25} max={1000000} step={1} required value={hours} onChange={e=>setHours(e.target.value)}/></label><p className="mt-3 text-xs leading-6 text-[#667184]">One volunteer helping for four verified hours contributes four volunteer-hours. Your package may span several activities or clubs. A request is a target for a quote, not confirmed funding or a guarantee of delivery.</p></fieldset>}
    <div className="grid gap-6 sm:grid-cols-2"><label><span className="label">Company / organization</span><input className="input" name="organizationName" required maxLength={160} autoComplete="organization" /></label><label><span className="label">Contact person</span><input className="input" name="contactName" required maxLength={120} autoComplete="name" /></label><label><span className="label">Work email</span><input className="input" name="email" type="email" required maxLength={254} autoComplete="email" /></label><label><span className="label">Budget (€) · optional</span><input className="input" name="budgetEuros" type="number" min={0.01} max={1000000} step={0.01} placeholder="e.g. 5000" /></label></div>
    <label><span className="label">{employee?'Your project, location and preferred dates':'What would you like to support?'}</span><textarea className="input min-h-32" name="message" required minLength={10} maxLength={3000} placeholder={employee?'Tell us the location, preferred dates, intended tasks and your team’s needs.':'Tell us the city, clubs or causes you would like to support and any preferred delivery dates.'} /></label>
    <label className="flex items-start gap-3 border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><input name="privacyAck" type="checkbox" required className="mt-1 h-4 w-4" /><span>I agree that RunYourEvent may use these details to respond to my enquiry. I have read the <Link className="underline" href="/privacy">privacy notice</Link>.</span></label>
    <div><button className="btn-primary" disabled={state==='sending'}>{state==='sending'?'Sending…':employee?'Request an employee project quote':'Request a sponsorship quote'}</button></div>
    {message&&<p role={state==='error'?'alert':'status'} className={`text-sm font-bold leading-6 ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
  </form>
}
