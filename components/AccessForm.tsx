'use client'
import {userMessage} from '@/lib/user-message'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Role='volunteer'|'club'
export default function AccessForm({initialRole='volunteer'}:{initialRole?:Role}) {
  const [role,setRole]=useState<Role>(initialRole)
  const [email,setEmail]=useState('')
  const [code,setCode]=useState('')
  const [step,setStep]=useState<'email'|'code'>('email')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [failed,setFailed]=useState(false)
  const [resendAt,setResendAt]=useState(0)
  const linkHandled=useRef(false)
  useEffect(()=>{
    if(linkHandled.current)return
    const hash=new URLSearchParams(window.location.hash.slice(1))
    const accessToken=hash.get('access_token');const refreshToken=hash.get('refresh_token')
    if(!accessToken&&!refreshToken&&!hash.has('error'))return
    linkHandled.current=true
    window.history.replaceState(null,'',window.location.pathname+window.location.search)
    if(!accessToken||!refreshToken){setFailed(true);setMessage("Dieser Anmeldelink ist ungültig oder abgelaufen. Fordere bitte eine neue E-Mail an.");return}
    setBusy(true);setFailed(false);setMessage("Dein Anmeldelink wird geprüft …")
    void (async()=>{
      try{
        const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_session',role:initialRole,accessToken,refreshToken})})
        const result=await response.json()
        if(!response.ok)throw new Error(userMessage(result.error)||"Dein Anmeldelink konnte nicht bestätigt werden. Fordere bitte einen neuen an.")
        window.location.replace(initialRole==='club'?'/club':'/volunteer')
      }catch(error){setFailed(true);setMessage(error instanceof Error?userMessage(error.message):"Dein Anmeldelink konnte nicht bestätigt werden. Fordere bitte einen neuen an.");setBusy(false)}
    })()
  },[initialRole])
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!event.currentTarget.reportValidity())return
    setBusy(true);setMessage('');setFailed(false)
    const action=step==='email'?'send_code':'verify_code'
    try {
      const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,email,role,code})})
      const result=await response.json()
      if(!response.ok)throw new Error(userMessage(result.error)||"Die Anmeldung hat nicht geklappt. Bitte versuch es noch einmal.")
      if(action==='send_code'){setStep('code');setResendAt(Date.now()+60000);setMessage(result.message?userMessage(result.message):"Schau in dein E-Mail-Postfach. Dort findest du deinen Anmeldelink oder Code.")}
      else window.location.assign(role==='club'?'/club':'/volunteer')
    }catch(error){setFailed(true);setMessage(error instanceof Error?userMessage(error.message):"Die Anmeldung hat nicht geklappt. Bitte versuch es noch einmal.")}finally{setBusy(false)}
  }
  function changeEmail(){setStep('email');setCode('');setMessage('');setFailed(false)}
  async function resend(){
    if(Date.now()<resendAt){setFailed(false);setMessage("Warte nach deiner letzten Anfrage bitte eine Minute, bevor du einen neuen Code anforderst.");return}
    setBusy(true);setMessage('');setFailed(false)
    try{const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'send_code',email,role})});const result=await response.json();if(!response.ok)throw new Error(userMessage(result.error)||"Der neue Code konnte nicht gesendet werden. Bitte versuch es noch einmal.");setResendAt(Date.now()+60000);setMessage("Eine neue Anmelde-E-Mail ist unterwegs. Öffne den Link oder gib den enthaltenen Code ein.")}catch(error){setFailed(true);setMessage(error instanceof Error?userMessage(error.message):"Der neue Code konnte nicht gesendet werden. Bitte versuch es noch einmal.")}finally{setBusy(false)}
  }
  return <div className="panel mt-10 p-6 sm:p-8"><form className="grid gap-6" onSubmit={submit}>
    <fieldset disabled={busy||step==='code'}><legend className="label">Wähle deinen Bereich</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{([['volunteer',"Engagementpass"],['club',"Mein Vereinsbereich"]] as const).map(([value,label])=><label key={value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm font-bold ${role===value?'border-[#9a741c] bg-[#f7f2e5]':'border-[#ded9cf]'}`}><input type="radio" name="role" value={value} checked={role===value} onChange={()=>setRole(value)}/>{label}</label>)}</div></fieldset>
    <label><span className="label">E-Mail-Adresse deiner Registrierung</span><input className="input" type="email" name="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} readOnly={step==='code'} disabled={busy} maxLength={254} required /></label>
    {step==='code'&&<label><span className="label">Anmeldecode aus der E-Mail</span><input className="input" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,''))} disabled={busy} required autoFocus /><span className="mt-2 block text-xs leading-6 text-[#667184]">Öffne den Link aus der neuesten E-Mail oder gib den enthaltenen Code ein. Anmeldelinks und Codes sind nur begrenzt gültig und einmal verwendbar.</span></label>}
    <div className="flex flex-wrap gap-3"><button className="btn-primary" type="submit" disabled={busy}>{busy?"Bitte warte …":step==='email'?"Anmeldelink per E-Mail senden":"Mein Konto öffnen"}</button>{step==='code'&&<><button className="btn-secondary" type="button" disabled={busy} onClick={changeEmail}>E-Mail-Adresse oder Kontotyp ändern</button><button className="text-link" type="button" disabled={busy} onClick={resend}>Neuen Code senden</button></>}</div>
    {message&&<p role={failed?'alert':'status'} className={`text-sm leading-7 ${failed?'text-red-700':'text-[#4f5b6c]'}`}>{message}</p>}
  </form><p className="mt-7 border-t border-[#ded9cf] pt-5 text-sm leading-7 text-[#667184]">Du bist neu hier? <Link className="underline underline-offset-4" href={role==='club'?'/seasonal-needs':'/volunteer-engine/volunteers'}>{role==='club'?"Erste Vereinsanfrage einreichen":"Dein Freiwilligenprofil erstellen"}</Link>. Dein Konto bleibt bei der Anmeldung privat.</p></div>
}
