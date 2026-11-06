'use client'
import {userMessage} from '@/lib/user-message'
import { useState } from 'react'
type Props={token:string;initialStatus:string}
export default function VolunteerInviteActions({token,initialStatus}:Props){
  const [status,setStatus]=useState(initialStatus); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false)
  async function act(action:'accept'|'decline'|'reconfirm'){
    setBusy(true);setMessage('')
    try{
      const response=await fetch('/api/volunteer-engine/invite',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,action})})
      const json=await response.json(); if(!response.ok) throw new Error(userMessage(json.error)||"Deine Rückmeldung konnte nicht gespeichert werden. Bitte versuch es noch einmal.")
      setStatus(json.status); setMessage(action==='accept'?"Du hast zugesagt. Dieses Gerät ist jetzt für die Anmeldung per QR-Code vor Ort bereit.":action==='reconfirm'?"Deine Teilnahme ist erneut bestätigt. Wir freuen uns auf dich.":"Du hast abgesagt. Dein Platz kann jetzt einer anderen Person angeboten werden.")
    }catch(error){setMessage(error instanceof Error?userMessage(error.message):"Deine Rückmeldung konnte nicht gespeichert werden. Bitte versuch es noch einmal.")}finally{setBusy(false)}
  }
  return <div className="mt-8 border-y border-black/[0.08] py-6">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8a671b]">Deine Rückmeldung · {status.replace('_',' ')}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      {['invited','applied'].includes(status)&&<><button className="btn-primary" disabled={busy} onClick={()=>act('accept')}>Für diesen Einsatz zusagen</button><button className="btn-secondary" disabled={busy} onClick={()=>act('decline')}>Absagen</button></>}
      {status==='accepted'&&<button className="btn-primary" disabled={busy} onClick={()=>act('reconfirm')}>Teilnahme erneut bestätigen</button>}
      {status==='reconfirmed'&&<p className="text-sm font-bold text-green-700">Deine Teilnahme ist bestätigt. Scanne bei deiner Ankunft den QR-Code des Veranstalters.</p>}
      {status==='checked_in'&&<p className="text-sm font-bold text-green-700">Du bist vor Ort angemeldet.</p>}
      {status==='completed'&&<p className="text-sm font-bold text-green-700">Dein Einsatz ist abgeschlossen.</p>}
    </div>
    {message&&<p role="status" className="mt-4 text-sm font-bold text-[#4f5b6c]">{message}</p>}
  </div>
}
