'use client'

import { FormEvent, useState } from 'react'

export default function VolunteerSignupForm(){
  const [state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message,setMessage]=useState('')

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setState('sending'); setMessage('')
    const form=event.currentTarget
    const data=Object.fromEntries(new FormData(form).entries())
    try{
      const response=await fetch('/api/volunteer-engine/volunteers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...data,guardianConsentReady:data.guardianConsentReady==='on',privacyAck:data.privacyAck==='on'})})
      const json=await response.json()
      if(!response.ok) throw new Error(json.error||'Registration could not be submitted.')
      setState('success'); setMessage('You are in the Volunteer Engine pool. Your profile can now be considered for suitable local micro-shifts.'); form.reset()
    }catch(error){setState('error');setMessage(error instanceof Error?error.message:'Registration could not be submitted.')}
  }

  return <form onSubmit={submit} className="mt-10 grid gap-6" noValidate>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <div className="grid gap-6 sm:grid-cols-2">
      <label><span className="label">First name</span><input className="input" name="firstName" required maxLength={80} /></label>
      <label><span className="label">Last name</span><input className="input" name="lastName" required maxLength={80} /></label>
      <label><span className="label">Email</span><input className="input" name="email" type="email" required maxLength={254} /></label>
      <label><span className="label">City</span><input className="input" name="city" required maxLength={120} /></label>
      <label><span className="label">Postcode <span className="font-normal text-[#7b8493]">optional</span></span><input className="input" name="postalCode" maxLength={30} /></label>
      <label><span className="label">Age group</span><select className="input" name="ageBand" defaultValue="" required><option value="" disabled>Select</option><option value="16_17">16–17</option><option value="18_20">18–20</option><option value="21_25">21–25</option><option value="26_plus">26+</option></select></label>
      <label className="sm:col-span-2"><span className="label">School / university <span className="font-normal text-[#7b8493]">optional</span></span><input className="input" name="schoolOrUniversity" maxLength={160} /></label>
    </div>
    <label><span className="label">What would you like to help with?</span><textarea className="input min-h-28 resize-y" name="interests" maxLength={1500} placeholder="Food stand, guest support, sports, content, setup, ticket/raffle sales…" /></label>
    <label><span className="label">Typical availability</span><textarea className="input min-h-24 resize-y" name="availability" maxLength={1500} placeholder="e.g. Saturdays, Sunday afternoons, evenings during university term…" /></label>
    <label className="flex items-start gap-3 border-t border-black/[0.08] pt-5 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="guardianConsentReady" type="checkbox" /><span>If I am under 18, I can provide parent or guardian consent where required for the role or event.</span></label>
    <label className="flex items-start gap-3 border-b border-black/[0.08] pb-5 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="privacyAck" type="checkbox" required /><span>I agree that RunYourEvent may store this profile and use it to identify suitable volunteer opportunities. I can request deletion or pause participation later.</span></label>
    <div className="flex flex-wrap items-center gap-4"><button type="submit" className="btn-primary" disabled={state==='sending'}>{state==='sending'?'Joining…':'Join the volunteer pool'}</button><span className="text-xs leading-5 text-[#7b8493]">Registration is free. Joining the pool does not obligate you to accept any shift.</span></div>
    {message&&<p role="status" className={`text-sm font-bold ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
  </form>
}
