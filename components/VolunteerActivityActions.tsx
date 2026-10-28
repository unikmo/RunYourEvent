'use client'

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
      if(!result.ok)throw new Error(json.error||'This activity could not be updated.')
      setMessage(response==='report_issue'?'Your issue has been recorded.':response==='cancel'?'Your participation has been cancelled.':response==='decline'?'Invitation declined.':response==='reconfirm'?'Attendance reconfirmed.':'Activity accepted.');setReportOpen(false);router.refresh()
    }catch(error){setMessage(error instanceof Error?error.message:'This activity could not be updated.')}finally{setBusy(false)}
  }
  function report(event:FormEvent<HTMLFormElement>){event.preventDefault();const note=String(new FormData(event.currentTarget).get('message')||'').trim();if(note.length>=10)void respond('report_issue',note)}
  const invited=status==='invited'
  const accepted=['accepted','reconfirmed'].includes(status)
  const attendance=['accepted','reconfirmed','checked_in'].includes(status)&&!!eventCode&&/^[a-f0-9]{24}$/i.test(eventCode)
  return <div className="mt-4"><div className="flex flex-wrap gap-3">
    {invited&&<><button className="btn-primary" onClick={()=>respond('accept')} disabled={busy}>Accept invitation</button><button className="btn-secondary" onClick={()=>respond('decline')} disabled={busy}>Decline</button></>}
    {status==='accepted'&&<button className="btn-secondary" onClick={()=>respond('reconfirm')} disabled={busy}>Reconfirm attendance</button>}
    {accepted&&<button className="btn-secondary" onClick={()=>respond('cancel')} disabled={busy}>Cancel participation</button>}
    {attendance&&<Link className="btn-primary" href={`/volunteer-engine/check-in?event=${eventCode}`}>Check in / out</Link>}
    <button className="text-link" type="button" aria-expanded={reportOpen} disabled={busy} onClick={()=>setReportOpen(v=>!v)}>{reportOpen?'Close issue form':'Report an issue'}</button>
  </div>{reportOpen&&<form className="mt-5 grid max-w-xl gap-3" onSubmit={report}><label><span className="label">What happened?</span><textarea className="input min-h-28" name="message" required minLength={10} maxLength={2000} placeholder="Describe the activity or attendance issue. Avoid including unnecessary personal details."/></label><div><button className="btn-secondary" disabled={busy}>{busy?'Sending…':'Submit issue'}</button></div></form>}{message&&<p className="mt-3 text-sm leading-6" role="status">{message}</p>}</div>
}
