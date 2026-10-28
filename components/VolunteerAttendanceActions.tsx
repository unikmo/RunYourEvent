'use client'
import {userMessage} from '@/lib/user-message'
import { useState } from 'react'
type Attendance={status:string;checkedInAt?:string|null;checkedOutAt?:string|null;title?:string;organizationName?:string}
export default function VolunteerAttendanceActions({eventCode,initial}:{eventCode:string;initial:Attendance}){
  const [attendance,setAttendance]=useState(initial); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  async function act(action:'check_in'|'check_out'){
    setBusy(true);setMessage('')
    try{
      const response=await fetch('/api/volunteer-engine/attendance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({eventCode,action})})
      const json=await response.json(); if(!response.ok) throw new Error(userMessage(json.error)||"Deine Anwesenheit konnte nicht erfasst werden. Bitte versuch es noch einmal.")
      setAttendance(json.attendance); setMessage(action==='check_in'?"Du bist angemeldet. Deine Ankunft ist erfasst.":"Du bist abgemeldet. Der Verein muss deine tatsächlich geleistete Zeit noch bestätigen. Erst dann zählt sie für deine Stunden und Anerkennungen.")
    }catch(error){setMessage(error instanceof Error?userMessage(error.message):"Deine Anwesenheit konnte nicht erfasst werden. Bitte versuch es noch einmal.")}finally{setBusy(false)}
  }
  const canIn=['accepted','reconfirmed','confirmed'].includes(attendance.status)&&!attendance.checkedInAt
  const canOut=!!attendance.checkedInAt&&!attendance.checkedOutAt
  return <div className="mt-8 border-y border-black/[0.08] py-7">
    <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8a671b]">Teilnahme · {attendance.status.replace('_',' ')}</p>
    <div className="mt-5 flex flex-wrap gap-3">{canIn&&<button className="btn-primary" disabled={busy} onClick={()=>act('check_in')}>Jetzt vor Ort anmelden</button>}{canOut&&<button className="btn-primary" disabled={busy} onClick={()=>act('check_out')}>Einsatz beenden &amp; abmelden</button>}{attendance.status==='completed'&&<p className="text-sm font-bold text-green-700">Deine Abmeldung ist erfasst. Der Verein bestätigt anschließend deine geleisteten Stunden.</p>}</div>
    {message&&<p role="status" className="mt-4 text-sm font-bold text-[#4f5b6c]">{message}</p>}
  </div>
}
