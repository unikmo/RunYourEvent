'use client'
import {userMessage} from '@/lib/user-message'

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
      const response=await fetch('/api/volunteer-engine/organizers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...data,coverageStatus:coverage,protectionSelected,responsibilityAck:data.responsibilityAck==='on',protectionAck:data.protectionAck==='on',transportAck:data.transportAck==='on',commercialAck:data.commercialAck==='on'})})
      const json=await response.json()
      if(!response.ok) throw new Error(userMessage(json.error)||"Dein Einsatz konnte nicht eingereicht werden. Bitte versuch es noch einmal.")
      setState('success'); setMessage("Dein Einsatz ist bei uns eingegangen. Wir können ihn jetzt prüfen und nach passenden Freiwilligen in deiner Nähe suchen."); form.reset(); setCoverage('')
    }catch(error){setState('error');setMessage(error instanceof Error?userMessage(error.message):"Dein Einsatz konnte nicht eingereicht werden. Bitte versuch es noch einmal.")}
  }

  return <form onSubmit={submit} className="mt-10 grid gap-6" noValidate>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <div className="grid gap-6 sm:grid-cols-2">
      <label><span className="label">Verein / Sportorganisation</span><input className="input" name="organizationName" required maxLength={160} /></label>
      <label><span className="label">Ansprechperson</span><input className="input" name="contactName" required maxLength={120} /></label>
      <label><span className="label">E-Mail</span><input className="input" name="email" type="email" required maxLength={254} /></label>
      <label><span className="label">Telefon <span className="font-normal text-[#7b8493]">freiwillig</span></span><input className="input" name="phone" type="tel" maxLength={60} /></label>
      <label><span className="label">Stadt</span><input className="input" name="city" required maxLength={120} /></label>
      <label><span className="label">Postleitzahl <span className="font-normal text-[#7b8493]">freiwillig</span></span><input className="input" name="postalCode" maxLength={30} /></label>
      <label><span className="label">Sportart</span><input className="input" name="sportType" placeholder="Zum Beispiel Fußball, Handball oder Basketball …" required maxLength={120} /></label>
      <label><span className="label">Einsatz / Spiel / Turnier</span><input className="input" name="activityName" placeholder="Zum Beispiel Heimspiel gegen … oder Jugendturnier …" required maxLength={160} /></label>
      <label><span className="label">Einsatzdatum</span><input className="input" name="eventDate" type="date" required /></label>
      <label><span className="label">Benötigte Helfer</span><input className="input" name="volunteersNeeded" type="number" min="1" max="500" required /></label>
    </div>

    <fieldset className="border-y border-black/[0.08] py-6">
      <legend className="label">Zeitraum · 2–4 Stunden</legend>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="label">Einsatzort / Treffpunkt</span><input className="input" name="venue" required maxLength={240} /></label>
        <label><span className="label">Beginn</span><input className="input" name="shiftStartLocal" type="time" required /></label>
        <label><span className="label">Ende</span><input className="input" name="shiftEndLocal" type="time" required /></label>
        <label className="sm:col-span-2"><span className="label">Wie kommen die Freiwilligen hin und zurück?</span><select className="input" name="transportMode" required defaultValue=""><option value="" disabled>Bitte auswählen</option><option value="independent">Eigene Anreise · der Ort ist gut erreichbar</option><option value="public_transport">Öffentliche Verkehrsmittel · passend zu den Einsatzzeiten</option><option value="local_reimbursement">Der Verein erstattet vereinbarte Fahrtkosten vor Ort</option><option value="station_shuttle">Abholung am Bahnhof / zentralen Treffpunkt</option><option value="organizer_transport">Der Verein organisiert den Transport</option></select></label>
        <label className="sm:col-span-2"><span className="label">Hinweise zur An- und Abreise <span className="font-normal text-[#7b8493]">freiwillig</span></span><textarea className="input min-h-24 resize-y" name="transportDetails" maxLength={1000} /></label>
      </div>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#4f5b6c]"><input className="mt-1 h-4 w-4" name="transportAck" type="checkbox" required /><span>Ich bestätige, dass Freiwillige zu den angegebenen Zeiten hin- und zurückkommen können. Andernfalls organisiert der Verein eine geeignete Fahrtmöglichkeit oder vereinbart eine Fahrtkostenerstattung.</span></label>
    </fieldset>

    <label><span className="label">Welche Aufgaben übernehmen die Freiwilligen?</span><textarea className="input min-h-28 resize-y" name="roleExamples" required maxLength={1500} placeholder="Zum Beispiel Einlass, Verpflegung, Aufbau, Anzeigetafel oder Vereinsbeiträge …" /></label>

    <fieldset className="border-y border-black/[0.08] py-6">
      <legend className="label">Sind vorübergehend mithelfende oder vereinsfremde Freiwillige bei diesen Aufgaben über eure bestehende Versicherung abgesichert?</legend>
      <div className="mt-4 grid gap-3 text-sm text-[#4f5b6c]">
        {[
          ['existing_confirmed','Yes — our existing volunteer/event policy covers them'],
          ['not_covered',"Nein – wir benötigen Volunteer Protection Plus"],
          ['unknown',"Unklar – wir möchten Volunteer Protection Plus nutzen"],
        ].map(([value,label])=><label key={value} className="flex items-start gap-3"><input className="mt-1 h-4 w-4" type="radio" name="coverageStatus" value={value} required checked={coverage===value} onChange={()=>setCoverage(value as Coverage)} /><span>{label}</span></label>)}
      </div>
      {coverage&&<div className="mt-6 bg-[#f5f1e7] p-5">
        <p className="text-sm font-black text-[#182237]">Volunteer Protection Plus · sofern verfügbar 1,50 € pro Person und Einsatztag</p>
        <p className="mt-2 text-sm leading-6 text-[#667184]">Zusätzlicher Versicherungsschutz hängt von der Verfügbarkeit sowie den Bedingungen und Voraussetzungen des jeweiligen Versicherers ab.</p>
        {protectionRequired?
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#4f5b6c]"><input className="mt-1 h-4 w-4" name="protectionAck" type="checkbox" required /><span>Ich bin damit einverstanden, dass vor der Freischaltung Volunteer Protection Plus erforderlich ist, wenn kein gleichwertiger bestehender Versicherungsschutz bestätigt wurde.</span></label>
          :
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#4f5b6c]"><input className="mt-1 h-4 w-4" name="protectionSelected" type="checkbox" /><span>Wir möchten Volunteer Protection Plus zusätzlich zu unserer bestehenden Versicherung nutzen.</span></label>
        }
      </div>}
    </fieldset>

    <label><span className="label">Möchtest du uns noch etwas mitteilen? <span className="font-normal text-[#7b8493]">freiwillig</span></span><textarea className="input min-h-24 resize-y" name="notes" maxLength={2000} /></label>

    <label className="flex items-start gap-3 border-t border-black/[0.08] pt-5 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="commercialAck" type="checkbox" required /><span>Ich akzeptiere die Vermittlungsgebühr von 10 € pro Person nach abgeschlossenem und bestätigtem Einsatz. Für eine Registrierung, Einladung oder nicht erschienene Person fällt sie nicht an.</span></label>
    <label className="flex items-start gap-3 border-b border-black/[0.08] pb-5 text-sm leading-6 text-[#5f6978]"><input className="mt-1 h-4 w-4" name="responsibilityAck" type="checkbox" required /><span>Mir ist bekannt, dass der gastgebende Verein für Betreuung, Einweisung, den Schutz von Minderjährigen, geeignete Aufgaben, nötige Einwilligungen, Sicherheit und die örtlichen Vorschriften verantwortlich bleibt.</span></label>
    <div className="flex flex-wrap items-center gap-4"><button type="submit" className="btn-primary" disabled={state==='sending'}>{state==='sending'?"Wird gesendet …":"Einsatz ausschreiben"}</button><span className="text-xs leading-5 text-[#7b8493]">Das Einreichen eines Einsatzes ist kostenlos.</span></div>
    {message&&<p role="status" className={'text-sm font-bold '+(state==='success'?'text-green-700':'text-red-700')}>{message}</p>}
  </form>
}
