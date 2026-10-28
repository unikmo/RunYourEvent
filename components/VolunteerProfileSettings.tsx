'use client'

import { FormEvent, useState } from 'react'
import {countries} from '@/lib/countries'

export default function VolunteerProfileSettings({displayName,slug,enabled,isMinor,country='',champsboard=false}:{displayName:string;slug:string;enabled:boolean;isMinor:boolean;country?:string;champsboard?:boolean}) {
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [publicEnabled,setPublicEnabled]=useState(enabled&&!isMinor)
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setMessage('')
    const fields=new FormData(event.currentTarget)
    try {
      const response=await fetch('/api/volunteer-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName:fields.get('displayName'),slug:fields.get('slug'),publicEnabled:publicEnabled&&!isMinor,country:fields.get('country'),champsboardEnabled:fields.has('champsboard')&&publicEnabled&&!isMinor})})
      const json=await response.json()
      if(!response.ok)throw new Error(json.error||'Your settings could not be saved.')
      setMessage(publicEnabled?'Saved. Your public page is ready to share.':'Saved. Your page is private.')
    }catch(error){setMessage(error instanceof Error?error.message:'Your settings could not be saved.')}finally{setBusy(false)}
  }
  return <section className="panel p-6 sm:p-8"><p className="eyebrow">Your visibility</p><h2 className="mt-3 text-2xl font-black">Share your contribution. Choose your audience.</h2><p className="mt-4 text-sm leading-7 text-[#667184]">Your page stays private until you publish it. A public page shows your chosen name, verified contribution and issued certificates. It never shows your email or private contact details.</p><form onSubmit={save} className="mt-6 grid gap-5">
    <label><span className="label">Display name</span><input className="input" name="displayName" defaultValue={displayName} minLength={2} maxLength={80} required autoComplete="nickname"/></label>
    <label><span className="label">Page address</span><div className="mb-2 break-all text-xs text-[#667184]">runyourevent.com/volunteers/</div><input className="input" name="slug" defaultValue={slug} minLength={3} maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="your-volunteer-name" required/><span className="field-help">Use lowercase letters, numbers and single hyphens.</span></label>
    {isMinor?<p className="rounded-lg bg-[#f7f5ef] p-4 text-sm leading-6">Public profiles are available from age 18. Your private progress and recognition remain available.</p>:<label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 h-4 w-4" type="checkbox" checked={publicEnabled} onChange={e=>setPublicEnabled(e.target.checked)}/><span>Publish my volunteer page. Anyone with the link can view it. I can make it private again here.</span></label>}
    {!isMinor&&<><label><span className="label">Country for your Champsboard</span><select name="country" className="input" defaultValue={country}><option value="">Choose country</option>{countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label><label className="flex items-start gap-3 text-sm leading-6"><input name="champsboard" type="checkbox" defaultChecked={champsboard} disabled={!publicEnabled}/><span>Show my public name, city, country and verified hours on the worldwide, country and city Champsboards. I can opt out here at any time.</span></label><a className="text-link" href="/champsboard">Explore the Champsboard →</a></>}
    <div><button className="btn-primary" disabled={busy}>{busy?'Saving…':'Save profile settings'}</button></div>
    {message&&<p className="text-sm font-bold" role="status">{message}</p>}
  </form></section>
}
