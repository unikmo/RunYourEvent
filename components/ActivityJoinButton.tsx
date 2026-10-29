'use client'
import {userMessage} from '@/lib/user-message'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ActivityJoinButton({opportunityId,available}:{opportunityId:string;available:boolean}) {
  const [state,setState]=useState<'idle'|'joining'|'accepted'|'error'|'signin'>('idle')
  const [message,setMessage]=useState('')
  const [groupCode,setGroupCode]=useState('')
  const [shareUrl,setShareUrl]=useState('')
  useEffect(()=>{const value=new URLSearchParams(window.location.search).get('group')||'';if(/^[a-f0-9]{16}$/.test(value))setGroupCode(value)},[])
  async function join() {
    setState('joining');setMessage('')
    try {
      const response=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'join_activity',opportunityId,groupCode:groupCode||null})})
      const result=await response.json()
      if(response.status===401){setState('signin');setMessage("Registriere dich als Freiwilliger oder öffne deinen persönlichen Einladungslink, um dich für diesen Einsatz anzumelden.");return}
      if(!response.ok)throw new Error(userMessage(result.error)||"Dein Platz konnte nicht bestätigt werden. Bitte versuch es noch einmal.")
      setState('accepted');setMessage("Dein Platz ist bestätigt. In deinem Engagementpass kannst du dich mit dem Verein absprechen. Deine Freunde müssen sich jeweils selbst anmelden. Ein geteilter Link reserviert keine weiteren Plätze.")
    }catch(error){setState('error');setMessage(error instanceof Error?userMessage(error.message):"Dein Platz konnte nicht bestätigt werden. Bitte versuch es noch einmal.")}
  }
  async function share() {
    const bytes=new Uint8Array(8);window.crypto.getRandomValues(bytes)
    const group=groupCode||Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('')
    setGroupCode(group)
    const url=`${window.location.origin}/activities?group=${group}#activity-${opportunityId}`
    setShareUrl(url)
    try {await navigator.clipboard.writeText(url);setMessage("Der Link ist kopiert. Jede Person meldet sich selbst an, solange Plätze frei sind.")} catch {setMessage("Kopiere den Link unten. Jede Person meldet sich selbst an, solange Plätze frei sind.")}
  }
  const signupHref=`/volunteer-engine/volunteers?activity=${encodeURIComponent(opportunityId)}${groupCode?`&group=${groupCode}`:''}`
  return <div className="mt-auto border-t border-black/[0.08] pt-5">
    {groupCode&&<p className="mb-4 text-xs leading-5 text-[#667184]">Du bist über einen Gruppenlink hier. Jede Person meldet sich selbst an. Für die Gruppe sind keine Plätze reserviert.</p>}
    <div className="flex flex-wrap gap-3">{state==='signin'?<><Link className="btn-primary" href={signupHref}>Als Freiwilliger registrieren</Link><Link className="btn-secondary" href="/access?role=volunteer">Schon registriert? Jetzt anmelden</Link></>:<button type="button" className="btn-primary" disabled={!available||state==='joining'||state==='accepted'} onClick={join}>{state==='joining'?"Wird bestätigt …":state==='accepted'?"Dein Platz ist bestätigt":available?"Meinen Platz bestätigen":"Zurzeit ausgebucht"}</button>}<button type="button" className="btn-secondary" onClick={share}>Freunde einladen</button></div>
    {state==='accepted'&&<Link className="text-link mt-4" href="/volunteer">Meinen Engagementpass öffnen →</Link>}
    {message&&<p role={state==='error'?'alert':'status'} className={`mt-4 text-sm leading-6 ${state==='error'?'text-red-700':'text-[#526175]'}`}>{message}</p>}
    {shareUrl&&<label className="mt-4 block"><span className="label">Dein Link für Freunde</span><input className="input text-xs" value={shareUrl} readOnly onFocus={event=>event.currentTarget.select()} /></label>}
  </div>
}
