'use client'

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
      if(response.status===401){setState('signin');setMessage('Join the volunteer pool or open your personal invitation link to confirm your own place.');return}
      if(!response.ok)throw new Error(result.error||'Your place could not be confirmed. Please try again.')
      setState('accepted');setMessage('Your place is confirmed. Open your volunteer passport to coordinate with the club. Each friend must confirm their own place; sharing a link does not reserve spaces.')
    }catch(error){setState('error');setMessage(error instanceof Error?error.message:'Your place could not be confirmed. Please try again.')}
  }
  async function share() {
    const bytes=new Uint8Array(8);window.crypto.getRandomValues(bytes)
    const group=groupCode||Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('')
    setGroupCode(group)
    const url=`${window.location.origin}/activities?group=${group}#activity-${opportunityId}`
    setShareUrl(url)
    try {await navigator.clipboard.writeText(url);setMessage('Friend link copied. Everyone confirms individually, subject to available places.')} catch {setMessage('Copy the friend link below. Everyone confirms individually, subject to available places.')}
  }
  const signupHref=`/volunteer-engine/volunteers?activity=${encodeURIComponent(opportunityId)}${groupCode?`&group=${groupCode}`:''}`
  return <div className="mt-auto border-t border-black/[0.08] pt-5">
    {groupCode&&<p className="mb-4 text-xs leading-5 text-[#667184]">You arrived with a friend group. Your place is confirmed individually; group spaces are not reserved.</p>}
    <div className="flex flex-wrap gap-3">{state==='signin'?<><Link className="btn-primary" href={signupHref}>Join the volunteer pool</Link><Link className="btn-secondary" href="/access?role=volunteer">Already registered? Sign in</Link></>:<button type="button" className="btn-primary" disabled={!available||state==='joining'||state==='accepted'} onClick={join}>{state==='joining'?'Confirming…':state==='accepted'?'Place confirmed':available?'Confirm my place':'Currently full'}</button>}<button type="button" className="btn-secondary" onClick={share}>Bring friends</button></div>
    {state==='accepted'&&<Link className="text-link mt-4" href="/volunteer">Open my volunteer passport →</Link>}
    {message&&<p role={state==='error'?'alert':'status'} className={`mt-4 text-sm leading-6 ${state==='error'?'text-red-700':'text-[#526175]'}`}>{message}</p>}
    {shareUrl&&<label className="mt-4 block"><span className="label">Your friend link</span><input className="input text-xs" value={shareUrl} readOnly onFocus={event=>event.currentTarget.select()} /></label>}
  </div>
}
