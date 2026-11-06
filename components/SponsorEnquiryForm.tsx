'use client'
import {userMessage} from '@/lib/user-message'

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
    if(!employee&&(!Number.isSafeInteger(requestedHours)||requestedHours<25||requestedHours>1000000)){setState('error');setMessage("Bitte wähle eine volle Stundenzahl ab 25 Stunden.");return}
    const budgetCents=values.budgetEuros === '' ? null : Math.round(Number(values.budgetEuros) * 100)
    if (budgetCents !== null && (!Number.isInteger(budgetCents) || budgetCents < 1 || budgetCents > 100000000)) {setState('error');setMessage("Bitte gib ein Budget größer als 0 € ein oder lass das Feld frei.");return}
    setState('sending');setMessage('')
    try {
      const response=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,action:'sponsor_enquiry',needId:needId||null,enquiryType:mode,requestedHours:employee?null:requestedHours,teamSize:employee?Number(values.teamSize):undefined,hoursPerEmployee:employee?Number(values.hoursPerEmployee):undefined,budgetCents,privacyAck:values.privacyAck==='on'})})
      const result=await response.json()
      if (!response.ok) throw new Error(userMessage(result.error)||"Deine Anfrage konnte nicht gesendet werden. Bitte versuch es noch einmal.")
      setState('success');setMessage(employee?"Deine Anfrage für einen Teameinsatz ist gespeichert. Bevor eine Rechnung oder Einladungen verschickt werden, vereinbaren wir Aufgaben, mögliche Teamgröße, Preis und Ablauf.":`Deine Anfrage über ${requestedHours} Stunden ist gespeichert. Damit sind noch keine Stunden finanziert oder garantiert. Umfang, Preis, Zeitraum und den Umgang mit nicht geleisteten Stunden vereinbaren wir vor der Rechnung.`);form.reset()
    } catch(error) {setState('error');setMessage(error instanceof Error?userMessage(error.message):"Deine Anfrage konnte nicht gesendet werden. Bitte versuch es noch einmal.")}
  }
  return <form onSubmit={submit} className="mt-8 grid gap-6">
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    {needId&&<div className="rounded-lg bg-[#f7f5ef] p-4 text-sm leading-6">{employee?"Deine Anfrage bezieht sich auf ein bestimmtes Vereinsprojekt.":"Deine Anfrage bezieht sich auf einen bestimmten Vereinsbedarf. Liegt er unter 25 Stunden, kann dein Sponsoring weitere passende Projekte umfassen."} <button type="button" className="underline" onClick={()=>setNeedId('')}>Stattdessen ein allgemeines Sponsoring anfragen</button></div>}
    {employee?<fieldset className="grid gap-5 rounded-xl border border-[#ded9cf] p-5 sm:grid-cols-2"><legend className="px-2 text-lg font-black">Dein Team</legend><label><span className="label">Ungefähre Anzahl der Mitarbeitenden</span><input className="input" name="teamSize" type="number" min={1} max={500} step={1} required defaultValue={10}/></label><label><span className="label">Einsatzstunden pro Person</span><input className="input" name="hoursPerEmployee" type="number" min={2} max={8} step={1} required defaultValue={4}/></label><p className="text-xs leading-6 text-[#667184] sm:col-span-2">Deine Mitarbeitenden helfen selbst mit. Du fragst einen gemeinsamen Teameinsatz an. Teamgröße, Pausen und anrechenbare Zeit klären wir vor der Buchung. Du finanzierst damit keine Stunden anderer Freiwilliger.</p></fieldset>:<fieldset className="rounded-xl border border-[#ded9cf] p-5"><legend className="px-2 text-lg font-black">Wie viele freiwillig geleistete Stunden möchtest du unterstützen?</legend><div className="mt-2 flex flex-wrap gap-3">{[25,50,100,250].map(h=><button type="button" className={Number(hours)===h?'btn-primary':'btn-secondary'} key={h} aria-pressed={Number(hours)===h} onClick={()=>setHours(String(h))}>{h} Stunden</button>)}</div><label className="mt-5 block"><span className="label">Deine gewünschte Stundenzahl · mindestens 25</span><input name="requestedHours" className="input" type="number" min={25} max={1000000} step={1} required value={hours} onChange={e=>setHours(e.target.value)}/></label><p className="mt-3 text-xs leading-6 text-[#667184]">Hilft eine Person vier bestätigte Stunden mit, sind das vier Stunden für dein Sponsoring. Du kannst mehrere Einsätze oder Vereine unterstützen. Mit deiner Anfrage erhältst du ein Angebot; sie bedeutet noch keine Finanzierung und garantiert keine geleisteten Stunden.</p></fieldset>}
    <div className="grid gap-6 sm:grid-cols-2"><label><span className="label">Unternehmen / Organisation</span><input className="input" name="organizationName" required maxLength={160} autoComplete="organization" /></label><label><span className="label">Ansprechperson</span><input className="input" name="contactName" required maxLength={120} autoComplete="name" /></label><label><span className="label">Geschäftliche E-Mail-Adresse</span><input className="input" name="email" type="email" required maxLength={254} autoComplete="email" /></label><label><span className="label">Budget (€) · freiwillig</span><input className="input" name="budgetEuros" type="number" min={0.01} max={1000000} step={0.01} placeholder="Zum Beispiel 5000" /></label></div>
    <label><span className="label">{employee?"Projekt, Ort & Wunschtermine":"Was möchtest du unterstützen?"}</span><textarea className="input min-h-32" name="message" required minLength={10} maxLength={3000} placeholder={employee?"Nenne uns den Ort, eure Wunschtermine, mögliche Aufgaben und die Bedürfnisse deines Teams.":"Sag uns, welche Stadt, Vereine oder Projekte du unterstützen möchtest und welchen Zeitraum du dir vorstellst."} /></label>
    <label className="flex items-start gap-3 border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><input name="privacyAck" type="checkbox" required className="mt-1 h-4 w-4" /><span>Ich bin damit einverstanden, dass RunYourEvent meine Angaben nutzt, um meine Anfrage zu beantworten. Ich habe die <Link className="underline" href="/privacy">Datenschutzhinweise</Link> gelesen.</span></label>
    <div><button className="btn-primary" disabled={state==='sending'}>{state==='sending'?"Wird gesendet …":employee?"Angebot für deinen Teameinsatz anfragen":"Sponsoringangebot anfragen"}</button></div>
    {message&&<p role={state==='error'?'alert':'status'} className={`text-sm font-bold leading-6 ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
  </form>
}
