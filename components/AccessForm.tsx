'use client'

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
    if(!accessToken||!refreshToken){setFailed(true);setMessage('This sign-in link is invalid or has expired. Request a new email.');return}
    setBusy(true);setFailed(false);setMessage('Verifying your sign-in link…')
    void (async()=>{
      try{
        const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_session',role:initialRole,accessToken,refreshToken})})
        const result=await response.json()
        if(!response.ok)throw new Error(result.error||'Your sign-in link could not be verified.')
        window.location.replace(initialRole==='club'?'/club':'/volunteer')
      }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'Your sign-in link could not be verified.');setBusy(false)}
    })()
  },[initialRole])
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!event.currentTarget.reportValidity())return
    setBusy(true);setMessage('');setFailed(false)
    const action=step==='email'?'send_code':'verify_code'
    try {
      const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,email,role,code})})
      const result=await response.json()
      if(!response.ok)throw new Error(result.error||'Sign-in could not be completed.')
      if(action==='send_code'){setStep('code');setResendAt(Date.now()+60000);setMessage(result.message||'Check your email for your sign-in link or code.')}
      else window.location.assign(role==='club'?'/club':'/volunteer')
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'Sign-in could not be completed.')}finally{setBusy(false)}
  }
  function changeEmail(){setStep('email');setCode('');setMessage('');setFailed(false)}
  async function resend(){
    if(Date.now()<resendAt){setFailed(false);setMessage('Please wait one minute after your last request before requesting another code.');return}
    setBusy(true);setMessage('');setFailed(false)
    try{const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'send_code',email,role})});const result=await response.json();if(!response.ok)throw new Error(result.error||'A new code could not be sent.');setResendAt(Date.now()+60000);setMessage('A new sign-in email has been sent. Open its link, or enter its code if included.')}catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'A new code could not be sent.')}finally{setBusy(false)}
  }
  return <div className="panel mt-10 p-6 sm:p-8"><form className="grid gap-6" onSubmit={submit}>
    <fieldset disabled={busy||step==='code'}><legend className="label">Open your</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{([['volunteer','Volunteer passport'],['club','Club workspace']] as const).map(([value,label])=><label key={value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm font-bold ${role===value?'border-[#9a741c] bg-[#f7f2e5]':'border-[#ded9cf]'}`}><input type="radio" name="role" value={value} checked={role===value} onChange={()=>setRole(value)}/>{label}</label>)}</div></fieldset>
    <label><span className="label">Registration email</span><input className="input" type="email" name="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} readOnly={step==='code'} disabled={busy} maxLength={254} required /></label>
    {step==='code'&&<label><span className="label">Email sign-in code</span><input className="input" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,''))} disabled={busy} required autoFocus /><span className="mt-2 block text-xs leading-6 text-[#667184]">Open the link in the latest email, or enter its code if included. Sign-in emails expire and can be used only once.</span></label>}
    <div className="flex flex-wrap gap-3"><button className="btn-primary" type="submit" disabled={busy}>{busy?'Please wait…':step==='email'?'Email me a sign-in link':'Open my account'}</button>{step==='code'&&<><button className="btn-secondary" type="button" disabled={busy} onClick={changeEmail}>Change email or account</button><button className="text-link" type="button" disabled={busy} onClick={resend}>Send a new code</button></>}</div>
    {message&&<p role={failed?'alert':'status'} className={`text-sm leading-7 ${failed?'text-red-700':'text-[#4f5b6c]'}`}>{message}</p>}
  </form><p className="mt-7 border-t border-[#ded9cf] pt-5 text-sm leading-7 text-[#667184]">New here? <Link className="underline underline-offset-4" href={role==='club'?'/seasonal-needs':'/volunteer-engine/volunteers'}>{role==='club'?'Submit your first club need':'Create your volunteer profile'}</Link>. Sign-in never makes your private account public.</p></div>
}
