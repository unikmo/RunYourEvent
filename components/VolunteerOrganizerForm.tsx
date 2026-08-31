'use client'

import { FormEvent, useState } from 'react'

type Coverage='existing_confirmed'|'not_covered'|'unknown'|''

export default function VolunteerOrganizerForm(){
  const [state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message,setMessage]=useState('')
  const [coverage,setCoverage]=useState<Coverage>('')
  const protectionRequired=coverage==='not_covered'||coverage==='unknown'

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setState('sending'); setMessage('')
    const form=event.currentTarget
    const data=Object.fromEntries(new FormData(form).entries())
    const protectionSelected=protectionRequired||data.protectionSelected==='on'
    try{
      const response=await fetch('/api/volunteer-engine/organizers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...data,coverageStatus:coverage,protectionSelected,responsibilityAck:data.responsibilityAck==='on',protectionAck:data.protectionAck==='on'})})
      const json=await response.json()
      if(!response.ok) throw new Error(json.error||'Request could not be submitted.')
      setState('success'); setMessage('Request received. Your volunteer requirement and protection choice are now in the RunYourEvent pipeline.'); form.reset(); setCoverage('')
    }catch(error){setState('error');setMessage(error instanceof Error?error.message:'Request could not be submitted.')}
  }

  return <form onSubmit={submit} className="mt-10 grid gap-6" noValidate>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <div className="grid gap-6 sm:grid-cols-2">
      <label><span className="label">Organization / club</span><input className="input" name="organizationName" required maxLength={160} /></label>
      <label><span className="label">Contact person</span><input className="input" name="contactName" required maxLength={120} /></label>
      <label><span className="label">Email</span><input className="input" name="email" type="email" required maxLength={254} /></label>
      <label><span className="label">Phone <span className="font-normal text-[#7b8493]">optional</span></span><input className="input" name="phone" type="tel" maxLength={60} /></label>
      <label><span className="label">City</span><input className="input" name="city" required maxLength={120} /></label>
      <label><span className="label">Postcode <span className="font-normal text-[#7b8493]">optional</span></span><input className="input" name="postalCode" maxLength={30} /></label>
      <label><span className="label">Recruitment model</span><select className="input" name="pipeline" required defaultValue=""><option value="" disabled>Select</option><option value="sports_club">Seasonal sports club · €200/season</option><option value="one_off_event">One-off event · success fee</option></select></label>
      <label><span className="label">Event / sport type</span><input className="input" name="eventType" placeholder="Football, marathon, festival…" maxLength={120} /></label>
      <label><span className="label">Event name <span className="font-normal text-[#7b8493]">optional</span></span><input className="input" name="eventName" maxLength={160} /></label>
      <label><span className="label">Event date <span className="font-normal text-[#7b8493]">if one-off</span></span><input className="input" name="eventDate" type="date" /></label>
      <label><span className="label">Season <span className="font-normal text-[#7b8493]">if recurring</span></span><input className="input" name="seasonLabel" placeholder="2026/27" maxLength={100} /></label>
      <label><span className="label">Volunteers needed</span><input className="input" name="volunteersNeeded" type="number" min="1" max="500" required /></label>
    </div>

    <label><span className="label">Typical roles</span><textarea className="input min-h-28 resize-y" name="roleExamples" maxLength={1500} placeholder="e.g. two people at the food stand, three raffle sellers, one content helper…" /></label>

    <fieldset className="border-y border-black/[0.08] py-6">
      <legend className="label">Does your existing insurance cover temporary / external volunteers for these event roles?</legend>
      <div className="mt-4 grid gap-3 text-sm text-[#4f5b6c]">
        {[
          ['existing_confirmed','Yes — our existing volunteer/event policy covers them'],
          ['not_covered','No — we need Volunteer Protection Plus'],
          ['unknown','Not sure — use Volunteer Protection Plus'],
        ].map(([value,label])=><label key={value} className="flex items-start gap-3"><input className="mt-1 h-4 w-4" type="radio" name="coverageStatus" value={value} required checked={coverage===value} onChange={()=>setCoverage(value as Coverage)} /><span>{label}</span></label>)}
      </div>

      {coverage&&<div className="mt-6 bg-[#f5f1e7] p-5">
        <p className="text-sm font-black text-[#182237]">Volunteer Protection Plus · €1.50 per confirmed volunteer/day</p>
        <p className="mt-2 text-sm leading-6 text-[#667184]">Protection is arranged only through the connected insurance partner and remains subject to the insurer's policy terms, eligibility and availability.</p>
        {protectionRequired?
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#4f5b6c]"><input className="mt-1 h-4 w-4" name="protectionAck" type="checkbox" required /><span>I agree that Volunteer Protection Plus is required before placements are activated and may be charged at €1.50 per confirmed volunteer/day once partner coverage is available.</span></label>
          :
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#4f5b6c]"><input className="mt-1 h-4 w-4" name="protectionSelected" type="checkbox" /><span>Add Volunteer Protection Plus in addition to our existing cover.</span></label>
        }
      </div>}
    </fieldset>

    <label><span className="label">Anything else we should know? <span className="font-normal text-[#7b8493]">optional</span></span><textarea className="input min-h-24 resize-y" name="notes" maxLength={2000} /></label>
    <label className="flex items-start gap-3 border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="responsibilityAck" type="checkbox" required /><span>I understand that the host organization remains responsible for on-site supervision, role briefing, safeguarding, age/role suitability, permissions, safety and compliance with applicable local rules. Insurance selection does not transfer these operational duties to RunYourEvent.</span></label>
    <div className="flex flex-wrap items-center gap-4"><button type="submit" className="btn-primary" disabled={state==='sending'}>{state==='sending'?'Submitting…':'Submit volunteer request'}</button><span className="text-xs leading-5 text-[#7b8493]">No placement or protection charge is due merely for submitting this request.</span></div>
    {message&&<p role="status" className={`text-sm font-bold ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
  </form>
}
