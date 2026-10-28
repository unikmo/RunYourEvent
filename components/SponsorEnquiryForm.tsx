'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

export default function SponsorEnquiryForm({needId: initialNeedId = ''}:{needId?:string}) {
  const [needId, setNeedId] = useState(initialNeedId)
  const [state, setState] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  useEffect(()=>{ if (!initialNeedId) setNeedId(new URLSearchParams(window.location.search).get('need') || '') },[initialNeedId])
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget
    if (!form.reportValidity()) return
    const values=Object.fromEntries(new FormData(form).entries())
    const budgetCents=values.budgetEuros === '' ? null : Math.round(Number(values.budgetEuros) * 100)
    if (budgetCents !== null && (!Number.isInteger(budgetCents) || budgetCents < 1 || budgetCents > 100000000)) {setState('error');setMessage('Enter a positive budget in euros, or leave it blank.');return}
    setState('sending');setMessage('')
    try {
      const response=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,action:'sponsor_enquiry',needId:needId||null,budgetCents,privacyAck:values.privacyAck==='on'})})
      const result=await response.json()
      if (!response.ok) throw new Error(result.error||'Your enquiry could not be submitted. Please try again.')
      setState('success');setMessage('Your enquiry has been received. We will review the scope and funding with you before any commitment or charge.');form.reset()
    } catch(error) {setState('error');setMessage(error instanceof Error?error.message:'Your enquiry could not be submitted. Please try again.')}
  }
  return <form onSubmit={submit} className="mt-8 grid gap-6">
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    {needId&&<div className="rounded-lg bg-[#f7f5ef] p-4 text-sm leading-6">This enquiry is linked to a club need. <button type="button" className="underline" onClick={()=>setNeedId('')}>Enquire about a broader campaign instead</button></div>}
    <div className="grid gap-6 sm:grid-cols-2"><label><span className="label">Company / organization</span><input className="input" name="organizationName" required maxLength={160} autoComplete="organization" /></label><label><span className="label">Contact person</span><input className="input" name="contactName" required maxLength={120} autoComplete="name" /></label><label><span className="label">Work email</span><input className="input" name="email" type="email" required maxLength={254} autoComplete="email" /></label><label><span className="label">Budget (€) · optional</span><input className="input" name="budgetEuros" type="number" min={0.01} max={1000000} step={0.01} placeholder="e.g. 5000" /></label></div>
    <label><span className="label">What would you like to support?</span><textarea className="input min-h-32" name="message" required minLength={10} maxLength={3000} placeholder="Tell us your city, clubs or causes, whether you want to fund all or part of a need, and any employee volunteering plans." /></label>
    <label className="flex items-start gap-3 border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><input name="privacyAck" type="checkbox" required className="mt-1 h-4 w-4" /><span>I agree that RunYourEvent may use these details to respond to my enquiry. I have read the <Link className="underline" href="/privacy">privacy notice</Link>.</span></label>
    <div><button className="btn-primary" disabled={state==='sending'}>{state==='sending'?'Sending…':'Discuss sponsorship'}</button></div>
    {message&&<p role={state==='error'?'alert':'status'} className={`text-sm font-bold leading-6 ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
  </form>
}
