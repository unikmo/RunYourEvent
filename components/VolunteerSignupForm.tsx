'use client'
import {userMessage} from '@/lib/user-message'

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
      if(!response.ok) throw new Error(userMessage(json.error)||"Deine Registrierung konnte nicht gespeichert werden. Bitte versuch es noch einmal.")
      setState('success'); setMessage(json.created?"Dein Engagementpass ist bereit. Such dir einen Einsatz aus und sprich dich direkt mit dem Verein ab.":"Du bist schon registriert? Öffne deinen Engagementpass auf dem bisher verwendeten Gerät oder melde dich über deinen persönlichen Link an. Deine E-Mail-Adresse allein gewährt keinen Zugriff auf dein Profil."); form.reset()
      if(json.created){const q=new URLSearchParams(window.location.search);const activity=q.get('activity');const group=q.get('group');window.location.assign(activity?'/activities'+(group&&/^[a-f0-9]{16}$/.test(group)?'?group='+group:'')+'#activity-'+activity:'/volunteer')}
    }catch(error){setState('error');setMessage(error instanceof Error?userMessage(error.message):"Deine Registrierung konnte nicht gespeichert werden. Bitte versuch es noch einmal.")}
  }

  return <form onSubmit={submit} className="mt-10 grid gap-6">
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <div className="grid gap-6 sm:grid-cols-2">
      <label><span className="label">Vorname</span><input className="input" name="firstName" required maxLength={80} /></label>
      <label><span className="label">Nachname</span><input className="input" name="lastName" required maxLength={80} /></label>
      <label><span className="label">E-Mail</span><input className="input" name="email" type="email" required maxLength={254} /></label>
      <label><span className="label">Stadt</span><input className="input" name="city" required maxLength={120} /></label>
      <label><span className="label">Postleitzahl <span className="font-normal text-[#7b8493]">freiwillig</span></span><input className="input" name="postalCode" maxLength={30} /></label>
      <label><span className="label">Altersgruppe</span><select className="input" name="ageBand" defaultValue="" required><option value="" disabled>Bitte auswählen</option><option value="16_17">16–17</option><option value="18_20">18–20</option><option value="21_25">21–25</option><option value="26_plus">ab 26 Jahren</option></select></label>
      <label className="sm:col-span-2"><span className="label">Schule / Hochschule <span className="font-normal text-[#7b8493]">freiwillig</span></span><input className="input" name="schoolOrUniversity" maxLength={160} /></label>
    </div>
    <label><span className="label">Bei welchen Aufgaben möchtest du mithelfen?</span><textarea className="input min-h-28 resize-y" name="interests" maxLength={1500} placeholder="Zum Beispiel Fußball, Basketball, Turniere, Einlass, Verpflegung, Aufbau oder Vereinsbeiträge …" /></label>
    <label><span className="label">Wann hast du Zeit?</span><textarea className="input min-h-24 resize-y" name="availability" maxLength={1500} placeholder="Zum Beispiel samstags, sonntagnachmittags oder unter der Woche abends …" /></label>
    <div className="border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><b className="text-[#182237]">Anerkennung für alle:</b> Bronze ab 20 bestätigten Stunden, Silber ab 40 und Gold ab 60 – mit einer von Hand unterschriebenen Gold-Urkunde.</div>
    <label className="flex items-start gap-3 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="guardianConsentReady" type="checkbox" /><span>Wenn ich unter 18 bin, kann ich die Zustimmung meiner Eltern oder Erziehungsberechtigten vorlegen, falls sie für den Einsatz erforderlich ist.</span></label>
    <label className="flex items-start gap-3 border-b border-black/[0.08] pb-5 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="privacyAck" type="checkbox" required /><span>Ich bin damit einverstanden, dass RunYourEvent mein Profil speichert und nutzt, um passende freiwillige Einsätze im Sport zu finden. Ich kann meine Teilnahme pausieren oder die Löschung meiner Daten anfordern.</span></label>
    <div className="flex flex-wrap items-center gap-4"><button type="submit" className="btn-primary" disabled={state==='sending'}>{state==='sending'?"Du wirst registriert …":"Jetzt als Freiwilliger registrieren"}</button><span className="text-xs leading-5 text-[#7b8493]">Die Registrierung ist kostenlos. Du entscheidest bei jedem Einsatz selbst, ob du zusagst. Deine verfügbaren Tage und E-Mail-Benachrichtigungen stellst du anschließend im Engagementpass ein.</span></div>
    {message&&<p role="status" className={'text-sm font-bold '+(state==='success'?'text-green-700':'text-red-700')}>{message}</p>}
  </form>
}
