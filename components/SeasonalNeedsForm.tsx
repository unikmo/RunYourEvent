'use client'
import {userMessage} from '@/lib/user-message'

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
      setState('error'); setMessage("Bitte prüfe die Anzahl der Helfer, die Dauer des Einsatzes und das Materialbudget."); return
    }
    if (String(values.seasonEnd) < String(values.seasonStart) || (values.activityDate && (String(values.activityDate) < String(values.seasonStart) || String(values.activityDate) > String(values.seasonEnd)))) {
      setState('error'); setMessage("Das Einsatzdatum muss innerhalb der Saison liegen. Das Ende muss nach dem Beginn liegen."); return
    }
    setState('sending'); setMessage('')
    try {
      const response = await fetch('/api/community', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...values, action:'seasonal_need', volunteerCount, hoursPerVolunteer, materialsBudgetCents, partialFunding:values.partialFunding === 'on', privacyAck:values.privacyAck === 'on'}) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Deine Anfrage konnte nicht gespeichert werden. Bitte versuch es noch einmal.")
      setState('success'); setMessage("Der Saisonbedarf deines Vereins ist gespeichert. In deinem Vereinsbereich kannst du jetzt Einsätze veröffentlichen und Freiwillige einladen. Ob die Finanzierung steht und Plätze besetzt sind, wird getrennt bestätigt."); form.reset(); setFormat('community')
    } catch (error) { setState('error'); setMessage(error instanceof Error ? userMessage(error.message) : "Deine Anfrage konnte nicht gespeichert werden. Bitte versuch es noch einmal.") }
  }

  return <form onSubmit={submit} className="mt-8 grid gap-6">
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <div className="grid gap-6 sm:grid-cols-2">
      <label><span className="label">Verein / Sportorganisation</span><input className="input" name="organizationName" required maxLength={160} autoComplete="organization" /></label>
      <label><span className="label">Ansprechperson</span><input className="input" name="contactName" required maxLength={120} autoComplete="name" /></label>
      <label><span className="label">E-Mail-Adresse der Ansprechperson</span><input className="input" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label><span className="label">Stadt</span><input className="input" name="city" required minLength={2} maxLength={120} autoComplete="address-level2" /></label>
    </div>
    <label><span className="label">Wo braucht dein Verein Unterstützung?</span><input className="input" name="title" required minLength={3} maxLength={160} placeholder="Zum Beispiel Hilfe beim Jugendturnier oder beim Streichen des Vereinsheims" /></label>
    <label><span className="label">Was ist zu tun, und wem hilft es?</span><textarea className="input min-h-32" name="description" required minLength={20} maxLength={3000} placeholder="Beschreibe die Aufgaben, wem sie helfen und was am Ende geschafft sein soll. Trage in die öffentliche Beschreibung keine persönlichen Kontaktdaten ein." /></label>
    <fieldset className="border-y border-black/[0.08] py-6"><legend className="label">Saison &amp; Einsatz</legend><div className="mt-4 grid gap-6 sm:grid-cols-2">
      <label><span className="label">Saisonbeginn</span><input className="input" name="seasonStart" type="date" required /></label>
      <label><span className="label">Saisonende</span><input className="input" name="seasonEnd" type="date" required /></label>
      <label><span className="label">Fester Einsatztermin · freiwillig</span><input className="input" name="activityDate" type="date" /><span className="field-help">Lass das Feld frei, wenn der Termin innerhalb der Saison noch flexibel ist.</span></label>
      <label><span className="label">Art des Einsatzes</span><select className="input" name="activityFormat" value={format} onChange={e=>setFormat(e.target.value)}><option value="community">Freiwilliger Einsatz · 2–4 Stunden</option><option value="corporate">Teameinsatz eines Unternehmens · bis zu 8 Stunden</option></select></label>
      <label><span className="label">Benötigte Helfer</span><input className="input" name="volunteerCount" type="number" min={1} max={500} step={1} required /></label>
      <label><span className="label">Stunden pro Person</span><input key={format} className="input" name="hoursPerVolunteer" type="number" min={2} max={format==='corporate'?8:4} step={1} defaultValue={format==='corporate'?8:4} required /></label>
    </div><p className="field-help mt-4">Erstelle pro Aufgabe oder wiederkehrendem Einsatz einen eigenen Eintrag. Weitere Aufgaben kannst du separat ergänzen. Für Teameinsätze erhältst du nach der Prüfung ein individuelles Angebot.</p></fieldset>
    <label><span className="label">Kenntnisse oder Qualifikationen · freiwillig</span><textarea className="input min-h-24" name="skills" maxLength={1500} placeholder="Nenne nötige Kenntnisse, Altersgrenzen oder Arbeiten, die Fachleute übernehmen müssen." /></label>
    <label><span className="label">Material &amp; Ausrüstung · freiwillig</span><textarea className="input min-h-24" name="materials" maxLength={1500} placeholder="Was stellt dein Verein bereit? Was muss noch finanziert werden?" /></label>
    <label><span className="label">Materialbudget (€) · freiwillig</span><input className="input" name="materialsBudgetEuros" type="number" min={0} max={1000000} step={0.01} placeholder="Zum Beispiel 250" /><span className="field-help">Ein geschätzter Betrag. Vermittlungsgebühren und ein mögliches Projektangebot kommen separat hinzu.</span></label>
    <label><span className="label">Betreuung &amp; Sicherheit vor Ort</span><textarea className="input min-h-28" name="supervision" required minLength={10} maxLength={2000} placeholder="Wer betreut den Einsatz? Beschreibe Einweisung, Ausrüstung und Anforderungen an Sicherheit und den Schutz von Minderjährigen. Fachreparaturen müssen qualifizierte Personen übernehmen." /></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-[#5f6978]"><input name="partialFunding" type="checkbox" defaultChecked className="mt-1 h-4 w-4" /><span>Auch eine Teilfinanzierung hilft uns. Ein Sponsor kann nach Absprache einen Teil dieses Bedarfs unterstützen.</span></label>
    <label className="flex items-start gap-3 border-y border-black/[0.08] py-5 text-sm leading-6 text-[#5f6978]"><input name="privacyAck" type="checkbox" required className="mt-1 h-4 w-4" /><span>Ich bin berechtigt, diese Anfrage für den Verein einzureichen, und stimme der Veröffentlichung der Einsatzbeschreibung zu. Kontaktdaten bleiben privat. Ich habe die <Link className="underline" href="/privacy">Datenschutzhinweise</Link> gelesen. Die Anfrage garantiert weder eine Finanzierung noch die Teilnahme von Freiwilligen.</span></label>
    <div><button className="btn-primary" disabled={state==='sending'}>{state==='sending'?"Wird gesendet …":"Saisonbedarf einreichen"}</button></div>
    {message && <p role={state==='error'?'alert':'status'} className={`text-sm leading-6 font-bold ${state==='success'?'text-green-700':'text-red-700'}`}>{message}</p>}
    {state==='success'&&<Link href="/club" className="text-link">Deinen Vereinsbereich öffnen →</Link>}
  </form>
}
