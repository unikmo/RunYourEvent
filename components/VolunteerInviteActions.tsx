'use client'

import { useState } from 'react'

type Props={token:string;initialStatus:string}

export default function VolunteerInviteActions({token,initialStatus}:Props){
  const [status,setStatus]=useState(initialStatus)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function act(action:'accept'|'decline'|'reconfirm'){
    setBusy(true);setMessage('')
    try{
      const response=await fetch('/api/volunteer-engine/invite',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,action})})
      const json=await response.json(); if(!response.ok) throw new Error(json.error||'Could not update the shift.')
      setStatus(json.status); setMessage(action==='accept'?'Shift accepted. This device is now signed in for event-day QR check-in.':action==='reconfirm'?'Attendance reconfirmed. See you at the event.':'Shift declined. The slot can now be offered to another volunteer.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not update the shift.')}finally{setBusy(false)}
  }

  return <div className="mt-8 border-y border-black/[0.08] py-6">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8a671b]">Your response · {status.replace('_',' ')}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      {['invited','applied'].includes(status)&&<><button className="btn-primary" disabled={busy} onClick={()=>act('accept')}>Accept this shift</button><button className="btn-secondary" disabled={busy} onClick={()=>act('decline')}>Decline</button></>}
      {status==='accepted'&&<button className="btn-primary" disabled={busy} onClick={()=>act('reconfirm')}>Reconfirm attendance</button>}
      {status==='reconfirmed'&&<p className="text-sm font-bold text-green-700">Reconfirmed. Scan the organizer's QR when you arrive.</p>}
      {status==='checked_in'&&<p className="text-sm font-bold text-green-700">Checked in.</p>}
      {status==='completed'&&<p className="text-sm font-bold text-green-700">Shift completed.</p>}
    </div>
    {message&&<p role="status" className="mt-4 text-sm font-bold text-[#4f5b6c]">{message}</p>}
  </div>
}
