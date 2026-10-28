'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Message={id:string;sender_role:string;body:string;created_at:string}

export default function Conversation({placementId,messages}:{placementId:string;messages:Message[]}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const router=useRouter()
  const [thread,setThread]=useState(messages)
  useEffect(()=>setThread(messages),[messages])
  useEffect(()=>{
    let active=true
    const refresh=async()=>{try {const response=await fetch(`/api/conversations/${placementId}`,{cache:'no-store'});if(response.ok){const data=await response.json();if(active&&Array.isArray(data.messages))setThread(data.messages)}}catch{}}
    const interval=window.setInterval(refresh,15000)
    return()=>{active=false;window.clearInterval(interval)}
  },[placementId])
  async function send(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return
    const message=String(new FormData(form).get('message')||'').trim();if(!message)return
    setBusy(true);setError('')
    try {const response=await fetch(`/api/conversations/${placementId}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Message could not be sent.');form.reset();router.refresh()}catch(err){setError(err instanceof Error?err.message:'Message could not be sent.')}finally{setBusy(false)}
  }
  return <div className="mt-8"><div className="panel divide-y divide-black/[0.08] px-6 sm:px-8">{thread.length===0?<p className="py-8 text-[#667184]">Start the conversation with practical questions about this activity.</p>:thread.map(message=><article key={message.id} className="py-6"><div className="flex flex-wrap justify-between gap-2 text-xs text-[#667184]"><b className="capitalize text-[#24324a]">{message.sender_role}</b><time dateTime={message.created_at}>{new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'}).format(new Date(message.created_at))}</time></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{message.body}</p></article>)}</div><form onSubmit={send} className="mt-6 grid gap-4"><label><span className="label">Message the other participant</span><textarea className="input min-h-32" name="message" required minLength={1} maxLength={2000} placeholder="Ask about the meeting point, tasks or practical arrangements." /></label><p className="text-xs leading-5 text-[#667184]">This conversation is visible to the volunteer and host club. Use placement issue reporting for a concern requiring review. Do not include sensitive personal information.</p><div><button className="btn-primary" disabled={busy}>{busy?'Sending…':'Send message'}</button></div>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}</form></div>
}
