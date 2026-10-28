'use client'
import {userMessage} from '@/lib/user-message'

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
      if(!response.ok)throw new Error(userMessage(json.error)||"Deine Einstellungen konnten nicht gespeichert werden. Bitte versuch es noch einmal.")
      setMessage(publicEnabled?"Gespeichert. Du kannst dein öffentliches Profil jetzt teilen.":"Gespeichert. Dein Profil ist privat.")
    }catch(error){setMessage(error instanceof Error?userMessage(error.message):"Deine Einstellungen konnten nicht gespeichert werden. Bitte versuch es noch einmal.")}finally{setBusy(false)}
  }
  return <section className="panel p-6 sm:p-8"><p className="eyebrow">Deine Sichtbarkeit</p><h2 className="mt-3 text-2xl font-black">Du entscheidest, wer dein Engagement sieht.</h2><p className="mt-4 text-sm leading-7 text-[#667184]">Dein Profil bleibt privat, bis du es veröffentlichst. Öffentlich sichtbar sind dein gewählter Name, bestätigte Stunden und ausgestellte Urkunden. Deine E-Mail-Adresse und privaten Kontaktdaten bleiben verborgen.</p><form onSubmit={save} className="mt-6 grid gap-5">
    <label><span className="label">Anzeigename</span><input className="input" name="displayName" defaultValue={displayName} minLength={2} maxLength={80} required autoComplete="nickname"/></label>
    <label><span className="label">Profiladresse</span><div className="mb-2 break-all text-xs text-[#667184]">runyourevent.com/volunteers/</div><input className="input" name="slug" defaultValue={slug} minLength={3} maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="your-volunteer-name" required/><span className="field-help">Verwende Kleinbuchstaben, Zahlen und einzelne Bindestriche.</span></label>
    {isMinor?<p className="rounded-lg bg-[#f7f5ef] p-4 text-sm leading-6">Ein öffentliches Profil ist ab 18 Jahren möglich. Deine Stunden und Anerkennungen kannst du unabhängig davon im privaten Bereich sehen.</p>:<label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 h-4 w-4" type="checkbox" checked={publicEnabled} onChange={e=>setPublicEnabled(e.target.checked)}/><span>Ich möchte mein Profil veröffentlichen. Jeder mit dem Link kann es ansehen. Hier kann ich es jederzeit wieder auf privat stellen.</span></label>}
    {!isMinor&&<><label><span className="label">Dein Land für das Champsboard</span><select name="country" className="input" defaultValue={country}><option value="">Land auswählen</option>{countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label><label className="flex items-start gap-3 text-sm leading-6"><input name="champsboard" type="checkbox" defaultChecked={champsboard} disabled={!publicEnabled}/><span>Ich möchte meinen öffentlichen Namen, meine Stadt, mein Land und meine bestätigten Stunden im Champsboard anzeigen lassen – weltweit, nach Land und nach Stadt. Hier kann ich meine Teilnahme jederzeit beenden.</span></label><a className="text-link" href="/champsboard">Zum Champsboard →</a></>}
    <div><button className="btn-primary" disabled={busy}>{busy?"Wird gespeichert …":"Profileinstellungen speichern"}</button></div>
    {message&&<p className="text-sm font-bold" role="status">{message}</p>}
  </form></section>
}
