'use client'

import { FormEvent, useMemo, useState } from 'react'

type AnyRow=Record<string,any>

export default function VolunteerOpsConsole({organizers,volunteers,opportunities,billing}:{organizers:AnyRow[];volunteers:AnyRow[];opportunities:AnyRow[];billing:AnyRow[]}){
  const [message,setMessage]=useState('')
  const [inviteUrl,setInviteUrl]=useState('')
  const [selectedVolunteer,setSelectedVolunteer]=useState('')
  const volunteer=useMemo(()=>volunteers.find(v=>v.id===selectedVolunteer),[selectedVolunteer,volunteers])

  async function createShift(e:FormEvent<HTMLFormElement>){e.preventDefault();setMessage('');const f=e.currentTarget;const d=Object.fromEntries(new FormData(f).entries());const response=await fetch('/api/admin/volunteer-engine/opportunities',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});const json=await response.json();setMessage(response.ok?'Shift opened. Refresh the dashboard to invite volunteers and display its event QR.':json.error||'Shift could not be opened.');if(response.ok)f.reset()}
  async function invite(e:FormEvent<HTMLFormElement>){e.preventDefault();setMessage('');setInviteUrl('');const d=Object.fromEntries(new FormData(e.currentTarget).entries());const response=await fetch('/api/admin/volunteer-engine/invitations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});const json=await response.json();if(response.ok){setInviteUrl(json.inviteUrl);setMessage('Invitation created. Send this personal magic link to the volunteer.')}else setMessage(json.error||'Invitation could not be created.')}

  return <section className="mt-8 grid gap-6 xl:grid-cols-2">
    <div className="panel p-6"><p className="eyebrow">Open a micro-shift</p><h2 className="mt-2 text-xl font-black text-[#23324a]">Turn a request into a recruitable shift</h2><form onSubmit={createShift} className="mt-6 grid gap-4">
      <select className="input" name="requestId" required defaultValue=""><option value="" disabled>Organizer request</option>{organizers.map(o=><option key={o.id} value={o.id}>{o.organization_name} · {o.event_name||o.season_label||o.city}</option>)}</select>
      <div className="grid gap-4 sm:grid-cols-2"><input className="input" name="title" required placeholder="Role / shift title"/><input className="input" name="slots" required type="number" min="1" max="500" placeholder="Slots"/><input className="input" name="eventDay" required type="date"/><input className="input" name="venue" required placeholder="Venue / meeting point"/><label><span className="label">Start</span><input className="input" name="shiftStart" required type="datetime-local"/></label><label><span className="label">End</span><input className="input" name="shiftEnd" required type="datetime-local"/></label></div>
      <textarea className="input min-h-24" name="roleDescription" required placeholder="What the volunteer will do"/>
      <select className="input" name="transportMode" required defaultValue="independent"><option value="independent">Independent arrival</option><option value="public_transport">Public transport</option><option value="local_reimbursement">Local transport reimbursed</option><option value="station_shuttle">Station / central shuttle</option><option value="organizer_transport">Organizer-provided transport</option></select>
      <textarea className="input min-h-20" name="transportDetails" placeholder="Transport / pickup details"/>
      <button className="btn-primary" type="submit">Open shift</button>
    </form></div>

    <div className="panel p-6"><p className="eyebrow">Invite a local volunteer</p><h2 className="mt-2 text-xl font-black text-[#23324a]">Personal shift login</h2><form onSubmit={invite} className="mt-6 grid gap-4">
      <select className="input" name="opportunityId" required defaultValue=""><option value="" disabled>Open shift</option>{opportunities.filter(o=>o.status==='open').map(o=><option key={o.id} value={o.id}>{o.organization_name} · {o.title} · {o.event_day}</option>)}</select>
      <select className="input" name="volunteerId" required value={selectedVolunteer} onChange={e=>setSelectedVolunteer(e.target.value)}><option value="" disabled>Volunteer</option>{volunteers.filter(v=>v.status==='active').map(v=><option key={v.id} value={v.id}>{v.first_name} {v.last_name} · {v.city}</option>)}</select>
      <button className="btn-primary" type="submit">Create invitation</button>
    </form>{inviteUrl&&<div className="mt-5 border-t pt-5"><p className="break-all text-xs font-bold text-[#4f5b6c]">{inviteUrl}</p><div className="mt-3 flex flex-wrap gap-3"><button className="btn-secondary" onClick={()=>navigator.clipboard.writeText(inviteUrl)}>Copy link</button>{volunteer?.email&&<a className="btn-secondary" href={`mailto:${encodeURIComponent(volunteer.email)}?subject=${encodeURIComponent('Your RunYourEvent volunteer shift')}&body=${encodeURIComponent(`Open your personal shift invitation and accept or decline here:\n\n${inviteUrl}`)}`}>Email volunteer</a>}</div></div>}
      {message&&<p className="mt-5 text-sm font-bold text-[#4f5b6c]">{message}</p>}
    </div>

    <div className="panel overflow-hidden xl:col-span-2"><div className="border-b p-6"><p className="eyebrow">Event QR</p><h2 className="mt-2 text-xl font-black text-[#23324a]">Arrival check-in links</h2></div><div className="grid gap-0 md:grid-cols-2">{opportunities.filter(o=>o.status==='open'||o.status==='full').map(o=>{const url=`https://runyourevent.com/volunteer-engine/check-in?event=${o.event_checkin_code}`;return <div key={o.id} className="border-b p-6 md:border-r"><p className="font-black text-[#23324a]">{o.organization_name} · {o.title}</p><p className="mt-1 text-xs text-[#7a8595]">{o.event_day} · {o.venue}</p><div className="mt-4 flex gap-5"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`} width="160" height="160" alt={`Check-in QR for ${o.title}`}/><div className="min-w-0"><p className="text-xs leading-5 text-[#667184]">Volunteers scan this at the venue after accepting their personal invitation. The QR alone cannot check in an unassigned volunteer.</p><a className="mt-3 block break-all text-xs font-bold text-[#8a671b]" href={url}>{url}</a></div></div></div>})}</div></div>

    <div className="panel overflow-hidden xl:col-span-2"><div className="border-b p-6"><p className="eyebrow">Attendance billing</p><h2 className="mt-2 text-xl font-black text-[#23324a]">No check-in, no placement fee</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-[.11em] text-[#8b94a2]"><tr><th className="p-4">Organizer</th><th className="p-4">Arrived</th><th className="p-4">Rate</th><th className="p-4">Placement</th><th className="p-4">Protection</th><th className="p-4">Total</th></tr></thead><tbody>{billing.map(x=><tr key={x.organizer_request_id} className="border-t"><td className="p-4 font-black text-[#23324a]">{x.organization_name}</td><td className="p-4">{x.successful_placements}</td><td className="p-4">€{(x.unit_fee_cents/100).toFixed(2)}</td><td className="p-4">€{(x.placement_amount_cents/100).toFixed(2)}</td><td className="p-4">€{(x.protection_amount_cents/100).toFixed(2)}</td><td className="p-4 font-black">€{(x.total_amount_cents/100).toFixed(2)}</td></tr>)}</tbody></table></div></div>
  </section>
}
