'use client'
import {userMessage} from '@/lib/user-message'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Response='accept'|'decline'|'cancel'|'reconfirm'|'report_issue'
export default function VolunteerActivityActions({placementId,status,eventCode}:{placementId:string;status:string;eventCode?:string|null}){
  const router=useRouter()
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [reportOpen,setReportOpen]=useState(false)
  async function respond(response:Response,note?:string){
    setBusy(true);setMessage('')
    try{
      const result=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'respond_activity',placementId,response,...(note?{message:note}:{})})})
      const json=await result.json()
      if(!result.ok)throw new Error(userMessage(json.error)||"Deine Rückmeldung zum Einsatz konnte nicht gespeichert werden.")
      setMessage(response==='report_issue'?"Deine Meldung ist gespeichert.":response==='cancel'?"Du hast deine Teilnahme abgesagt.":response==='decline'?"Du hast die Einladung abgelehnt.":response==='reconfirm'?"Deine Teilnahme ist erneut bestätigt.":"Du hast für den Einsatz zugesagt.");setReportOpen(false);router.refresh()
    }catch(error){setMessage(error instanceof Error?userMessage(error.message):"Deine Rückmeldung zum Einsatz konnte nicht gespeichert werden.")}finally{setBusy(false)}
  }
  function report(event:FormEvent<HTMLFormElement>){event.preventDefault();const note=String(new FormData(event.currentTarget).get('message')||'').trim();if(note.length>=10)void respond('report_issue',note)}
  const invited=status==='invited'
  const accepted=['accepted','reconfirmed'].includes(status)
  const attendance=['accepted','reconfirmed','checked_in'].includes(status)&&!!eventCode&&/^[a-f0-9]{24}$/i.test(eventCode)
  return <div className="mt-4"><div className="flex flex-wrap gap-3">
    {invited&&<><button className="btn-primary" onClick={()=>respond('accept')} disabled={busy}>Einladung annehmen</button><button className="btn-secondary" onClick={()=>respond('decline')} disabled={busy}>Absagen</button></>}
    {status==='accepted'&&<button className="btn-secondary" onClick={()=>respond('reconfirm')} disabled={busy}>Teilnahme erneut bestätigen</button>}
    {accepted&&<button className="btn-secondary" onClick={()=>respond('cancel')} disabled={busy}>Teilnahme absagen</button>}
    {attendance&&<Link className="btn-primary" href={`/volunteer-engine/check-in?event=${eventCode}`}>Vor Ort an- / abmelden</Link>}
    <button className="text-link" type="button" aria-expanded={reportOpen} disabled={busy} onClick={()=>setReportOpen(v=>!v)}>{reportOpen?"Meldung schließen":"Problem melden"}</button>
  </div>{reportOpen&&<form className="mt-5 grid max-w-xl gap-3" onSubmit={report}><label><span className="label">Was ist passiert?</span><textarea className="input min-h-28" name="message" required minLength={10} maxLength={2000} placeholder="Beschreibe das Problem mit deinem Einsatz oder deiner Anwesenheit. Gib nur die persönlichen Angaben an, die dafür nötig sind."/></label><div><button className="btn-secondary" disabled={busy}>{busy?"Wird gesendet …":"Meldung senden"}</button></div></form>}{message&&<p className="mt-3 text-sm leading-6" role="status">{message}</p>}</div>
}
