'use client'

import { useState } from 'react'

type Attendance={status:string;checkedInAt?:string|null;checkedOutAt?:string|null;title?:string;organizationName?:string}

export default function VolunteerAttendanceActions({eventCode,initial}: {eventCode:string;initial:Attendance}){
  const [attendance,setAttendance]=useState(initial); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  async function act(action:'check_in'|'check_out'){
    setBusy(true);setMessage('')
    try{
      const response=await fetch('/api/volunteer-engine/attendance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({eventCode,action})})
      const json=await response.json(); if(!response.ok) throw new Error(json.error||'Attendance could not be recorded.')
      setAttendance(json.attendance);setMessage(action==='check_in'?'Checked in. Your arrival is now the attendance record for this placement.':'Checked out. Your shift has been recorded for organizer verification and volunteer points.')
    }catch(error){setMessage(error instanceof Error?error.message:'Attendance could not be recorded.')}finally{setBusy(false)}
  }
  const canIn=['accepted','reconfirmed','confirmed'].includes(attendance.status)&&!attendance.checkedInAt
  const canOut=!!attendance.checkedInAt&&!attendance.checkedOutAt
  return <div className="mt-8 border-y border-black/[0.08] py-7">
    <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">Attendance · {attendance.status.replace('_',' ')}</p>
    <div className="mt-5 flex flex-wrap gap-3">{canIn&&<button className="btn-primary" disabled={busy} onClick={()=>act('check_in')}>Check in now</button>}{canOut&&<button className="btn-primary" disabled={busy} onClick={()=>act('check_out')}>Check out now</button>}{attendance.status==='completed'&&<p className="text-sm font-bold text-green-700">Shift completed.</p>}</div>
    {message&&<p role="status" className="mt-4 text-sm font-bold text-[#4f5b6c]">{message}</p>}
  </div>
}
