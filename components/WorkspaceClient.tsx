'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, GitBranch, ListChecks, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react'

type WorkspaceData={role:string;workspace:any;members:any[];tasks:any[];comments:any[];runOfShow:any[];activity:any[];metrics:any}

export default function WorkspaceClient({workspaceId}:{workspaceId:string}){
  const [data,setData]=useState<WorkspaceData|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [tab,setTab]=useState<'tasks'|'team'|'run'|'activity'>('tasks')
  const [workstream,setWorkstream]=useState('all')
  const [inviteUrl,setInviteUrl]=useState('')
  const [message,setMessage]=useState('')
  const [newDate,setNewDate]=useState('')

  async function load(silent=false){
    if(!silent)setLoading(true)
    const res=await fetch(`/api/workspaces/${workspaceId}`,{cache:'no-store'})
    const body=await res.json().catch(()=>({}))
    if(!res.ok){setError(body.error||'Workspace could not be loaded.');setLoading(false);return}
    setData(body);setNewDate(body.workspace?.event_date||'');setError('');setLoading(false)
  }
  useEffect(()=>{load();const timer=setInterval(()=>load(true),10000);return()=>clearInterval(timer)},[workspaceId])

  const canWrite=data?.role==='owner'||data?.role==='editor'
  const isOwner=data?.role==='owner'
  const metrics=data?.metrics||{}
  const readiness=metrics.total?Math.round((metrics.done/metrics.total)*100):0
  const criticalReadiness=metrics.criticalTotal?Math.round((metrics.criticalDone/metrics.criticalTotal)*100):100
  const streams=useMemo(()=>Array.from(new Set((data?.tasks||[]).map((t:any)=>t.workstream))).sort(),[data])
  const visibleTasks=(data?.tasks||[]).filter((t:any)=>workstream==='all'||t.workstream===workstream)

  async function patchTask(task:any,body:any){
    setMessage('')
    const res=await fetch(`/api/workspaces/${workspaceId}/tasks/${task.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    const out=await res.json().catch(()=>({}))
    if(!res.ok){setMessage(out.error||'Task update failed.');return}
    if(out.replan?.downstreamTasks!=null)setMessage(`Plan recalculated: ${out.replan.downstreamTasks} downstream task${out.replan.downstreamTasks===1?'':'s'} moved.`)
    await load(true)
  }

  async function replanEvent(){
    const res=await fetch(`/api/workspaces/${workspaceId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventDate:newDate})})
    const out=await res.json().catch(()=>({}))
    if(!res.ok){setMessage(out.error||'Event replanning failed.');return}
    setMessage(`${out.replan?.tasksReplanned||0} task dates recalculated from the new event date.`);await load(true)
  }

  async function invite(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const fd=new FormData(e.currentTarget)
    const res=await fetch(`/api/workspaces/${workspaceId}/invite`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fd.get('name'),email:fd.get('email'),role:fd.get('role')})})
    const out=await res.json().catch(()=>({}));if(!res.ok){setMessage(out.error||'Invite failed.');return}setInviteUrl(out.inviteUrl);e.currentTarget.reset();await load(true)
  }

  if(loading)return <main className="shell py-10"><p className="eyebrow">RunYourEvent workspace</p><h2 className="page-title mt-4">Loading execution plan…</h2></main>
  if(error||!data)return <main className="shell py-10"><p className="eyebrow">Workspace access</p><h2 className="page-title mt-4">This workspace is not available in this browser.</h2><p className="mt-4 text-[#687386]">{error}</p></main>

  return <main className="min-h-screen bg-[#f5f2ea] pb-10">
    <section className="border-b border-black/[.055] bg-[#15233f] text-white"><div className="shell py-9">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#efcd6d]">Live execution workspace · {data.role}</p><h2 className="page-title mt-3">{data.workspace.name}</h2><p className="mt-3 text-sm text-white/70">Changes sync every 10 seconds for collaborators. Task updates recalculate readiness immediately.</p><a href="/my-events" className="mt-3 inline-block text-xs font-black text-[#efcd6d]">← My events</a></div>
      <div className="flex flex-wrap gap-2"><input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} disabled={!canWrite} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"/><button onClick={replanEvent} disabled={!canWrite||!newDate} className="rounded-xl bg-[#efcd6d] px-4 py-2 text-sm font-black text-[#15233f]">Replan event</button><button onClick={()=>load()} className="rounded-xl border border-white/15 px-3 py-2"><RefreshCw size={16}/></button></div></div>
    </div></section>

    <div className="shell mt-7">
      {message&&<div className="mb-5 rounded-2xl border border-[#eadfbd] bg-[#fff9e9] p-4 text-sm font-bold text-[#725d2d]">{message}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={<CheckCircle2 size={16}/>} label="Readiness" value={`${readiness}%`}/><Metric icon={<ShieldCheck size={16}/>} label="Critical path" value={`${criticalReadiness}%`}/><Metric icon={<ListChecks size={16}/>} label="Tasks done" value={`${metrics.done||0}/${metrics.total||0}`}/><Metric icon={<AlertTriangle size={16}/>} label="Blocked" value={metrics.blocked||0}/><Metric icon={<Clock3 size={16}/>} label="Overdue" value={metrics.overdue||0}/><Metric icon={<UsersRound size={16}/>} label="Team" value={data.members.filter((m:any)=>m.accepted_at).length}/>
      </div>

      <nav className="mt-7 flex gap-2 overflow-x-auto">{[['tasks','Tasks'],['team','Team'],['run','Run of Show'],['activity','Activity']].map(([k,l])=><button key={k} onClick={()=>setTab(k as any)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${tab===k?'bg-[#15233f] text-white':'bg-white text-[#566277]'}`}>{l}</button>)}</nav>

      {tab==='tasks'&&<section className="mt-6 space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Execution graph</p><h3 className="mt-2 text-2xl font-black text-[#23324a]">Live task control</h3></div><select className="input max-w-xs" value={workstream} onChange={e=>setWorkstream(e.target.value)}><option value="all">All workstreams</option>{streams.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        {visibleTasks.map((task:any)=><TaskCard key={task.id} task={task} members={data.members} comments={data.comments.filter((c:any)=>c.task_id===task.id)} canWrite={Boolean(canWrite)} onPatch={(body:any)=>patchTask(task,body)} onComment={async(body:string)=>{const res=await fetch(`/api/workspaces/${workspaceId}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({taskId:task.id,body,author:data.role})});if(res.ok)await load(true)}}/>)}</section>}

      {tab==='team'&&<section className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><div className="panel p-6"><p className="eyebrow">Collaborators</p><h3 className="mt-2 text-2xl font-black text-[#23324a]">People executing this event</h3><div className="mt-5 divide-y">{data.members.map((m:any)=><div key={m.id} className="py-4"><div className="flex justify-between gap-4"><div><p className="font-black text-[#23324a]">{m.name}</p><p className="mt-1 text-xs text-[#7a8595]">{m.email||'No email stored'} · {m.accepted_at?'Joined':'Invite pending'}</p></div><span className="text-[10px] font-black uppercase text-[#9a7b31]">{m.role}</span></div></div>)}</div></div>
        <div className="panel p-6"><p className="eyebrow">Invite</p><h3 className="mt-2 text-2xl font-black text-[#23324a]">Add an editor or viewer</h3>{isOwner?<form onSubmit={invite} className="mt-5 space-y-4"><input name="name" className="input" placeholder="Name"/><input name="email" type="email" className="input" placeholder="Email (optional)"/><select name="role" className="input"><option value="editor">Editor — update execution</option><option value="viewer">Viewer — follow progress</option></select><button className="btn-primary" type="submit">Create invitation link</button></form>:<p className="mt-4 text-sm text-[#687386]">Only the workspace owner can invite collaborators.</p>}{inviteUrl&&<div className="mt-5 rounded-2xl bg-[#f5f2ea] p-4"><p className="text-xs font-black text-[#23324a]">Share this secure invite link</p><input readOnly className="input mt-2 text-xs" value={inviteUrl}/></div>}</div></section>}

      {tab==='run'&&<RunOfShow workspaceId={workspaceId} items={data.runOfShow} canWrite={Boolean(canWrite)} reload={()=>load(true)} setMessage={setMessage}/>}

      {tab==='activity'&&<section className="panel mt-6 overflow-hidden"><div className="p-6"><p className="eyebrow">Audit trail</p><h3 className="mt-2 text-2xl font-black text-[#23324a]">Workspace activity</h3></div><div className="divide-y">{data.activity.map((a:any)=><div key={a.id} className="grid gap-1 p-4 text-sm sm:grid-cols-[180px_140px_1fr]"><b>{a.event_name.replaceAll('_',' ')}</b><span className="text-[#8b7440]">{a.actor||'RunYourEvent'}</span><span className="text-[#7a8595]">{new Date(a.created_at).toLocaleString()}</span></div>)}</div></section>}
    </div>
  </main>
}

function Metric({icon,label,value}:{icon:React.ReactNode,label:string,value:any}){return <div className="panel p-5"><div className="flex items-center gap-2 text-[#9a7b31]">{icon}<span className="text-[10px] font-black uppercase tracking-[.1em]">{label}</span></div><p className="mt-2 text-2xl font-black text-[#23324a]">{value}</p></div>}

function TaskCard({task,members,comments,canWrite,onPatch,onComment}:{task:any,members:any[],comments:any[],canWrite:boolean,onPatch:(b:any)=>void,onComment:(b:string)=>Promise<void>}){
  const [evidence,setEvidence]=useState(task.evidence_note||'');const [comment,setComment]=useState('')
  return <article className="panel p-5 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[.1em] text-[#9a7b31]">{task.workstream}</span>{task.critical_path&&<span className="rounded-full bg-[#f3ead2] px-2 py-1 text-[9px] font-black text-[#80631f]">Critical path</span>}</div><h3 className="mt-2 text-lg font-black text-[#23324a]">{task.title}</h3><p className="mt-2 text-sm leading-6 text-[#687386]">{task.description}</p></div><select disabled={!canWrite} value={task.status} onChange={e=>{let reason='';if(e.target.value==='blocked')reason=window.prompt('What is blocking this task?')||'';onPatch({status:e.target.value,ownerMemberId:task.owner_member_id,evidenceNote:evidence,blockedReason:reason})}} className="input max-w-[220px]"><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="awaiting_approval">Awaiting approval</option><option value="done">Done</option></select></div>
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><div className="metric"><b>Owner</b><select disabled={!canWrite} value={task.owner_member_id||''} onChange={e=>onPatch({status:task.status,ownerMemberId:e.target.value||null,evidenceNote:evidence})} className="mt-2 w-full bg-transparent text-xs"><option value="">{task.owner_label||'Unassigned'}</option>{members.filter(m=>m.accepted_at).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div><div className="metric"><b>Target date</b><input disabled={!canWrite} type="date" defaultValue={task.target_date||''} onBlur={e=>{if(e.target.value&&e.target.value!==task.target_date)onPatch({targetDate:e.target.value})}} className="mt-2 w-full bg-transparent text-xs"/></div><div className="metric"><b>Depends on</b><p className="mt-1">{Array.isArray(task.depends_on)&&task.depends_on.length?task.depends_on.join(', '):'No hard dependency'}</p></div><div className="metric"><b>Done when</b><p className="mt-1">{task.completion_criteria||'Completion verified'}</p></div></div>
    {task.blocked_reason&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800"><b>Blocked:</b> {task.blocked_reason}</p>}
    {(task.approval_required||task.risk_level||task.contingency)&&<div className="mt-4 rounded-2xl border border-[#eadfbd] bg-[#fbf7ea] p-4 text-xs leading-5 text-[#725d2d]">{task.approval_required&&<p><b>Approval:</b> {task.approver||'Required'}</p>}{task.risk_level&&<p><b>Risk:</b> {task.risk_level} — {task.risk_if_missed}</p>}{task.contingency&&<p><b>Contingency:</b> {task.contingency}</p>}</div>}
    <details className="mt-4"><summary className="cursor-pointer text-sm font-black text-[#566277]">Evidence & comments ({comments.length})</summary><div className="mt-4 grid gap-4 lg:grid-cols-2"><div><label className="label">Completion evidence</label><textarea disabled={!canWrite} value={evidence} onChange={e=>setEvidence(e.target.value)} className="input min-h-24" placeholder={task.evidence_required||'Record what proves completion.'}/>{canWrite&&<button onClick={()=>onPatch({status:task.status,ownerMemberId:task.owner_member_id,evidenceNote:evidence})} className="btn-secondary mt-2">Save evidence</button>}</div><div><div className="max-h-40 space-y-2 overflow-auto">{comments.map(c=><div key={c.id} className="rounded-xl bg-[#f5f2ea] p-3 text-xs"><b>{c.author_name}</b><p className="mt-1 text-[#687386]">{c.body}</p></div>)}</div><textarea value={comment} onChange={e=>setComment(e.target.value)} className="input mt-2 min-h-20" placeholder="Add a comment"/><button onClick={async()=>{if(!comment.trim())return;await onComment(comment);setComment('')}} className="btn-secondary mt-2">Add comment</button></div></div></details>
  </article>
}

function RunOfShow({workspaceId,items,canWrite,reload,setMessage}:{workspaceId:string,items:any[],canWrite:boolean,reload:()=>Promise<void>,setMessage:(s:string)=>void}){
  const [form,setForm]=useState({startTime:'',durationMinutes:15,cue:'',owner:'',location:'',technicalCue:'',contingency:'',notes:'',status:'planned'})
  async function save(payload:any){const res=await fetch(`/api/workspaces/${workspaceId}/run-of-show`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const out=await res.json().catch(()=>({}));if(!res.ok){setMessage(out.error||'Run of Show update failed.');return false}if(!payload.id)setForm({startTime:'',durationMinutes:15,cue:'',owner:'',location:'',technicalCue:'',contingency:'',notes:'',status:'planned'});await reload();return true}
  async function remove(id:string){const res=await fetch(`/api/workspaces/${workspaceId}/run-of-show`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(!res.ok){setMessage('Run of Show item could not be removed.');return}await reload()}
  return <section className="mt-6"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Event day</p><h3 className="mt-2 text-2xl font-black text-[#23324a]">Run of Show</h3><p className="mt-2 max-w-2xl text-sm text-[#687386]">Exact cues, owners, locations, handoffs and contingencies for live execution.</p></div><GitBranch className="text-[#9a7b31]"/></div>
    {canWrite&&<div className="panel mt-5 grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4"><input type="time" className="input" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/><input className="input" placeholder="Cue / moment" value={form.cue} onChange={e=>setForm({...form,cue:e.target.value})}/><input className="input" placeholder="Owner" value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/><input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input type="number" className="input" min="0" value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/><input className="input" placeholder="Technical cue" value={form.technicalCue} onChange={e=>setForm({...form,technicalCue:e.target.value})}/><input className="input" placeholder="Contingency" value={form.contingency} onChange={e=>setForm({...form,contingency:e.target.value})}/><select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Planned</option><option value="ready">Ready</option><option value="live">Live</option><option value="complete">Complete</option><option value="at_risk">At risk</option></select><button className="btn-primary md:col-span-2 xl:col-span-4" onClick={()=>save(form)}>Add Run of Show item</button></div>}
    <div className="mt-5 space-y-3">{items.map((r:any)=><RosRow key={r.id} item={r} canWrite={canWrite} save={save} remove={remove}/>)}</div>
  </section>
}

function RosRow({item,canWrite,save,remove}:{item:any,canWrite:boolean,save:(p:any)=>Promise<boolean>,remove:(id:string)=>Promise<void>}){
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState({id:item.id,startTime:item.start_time?.slice(0,5)||'',durationMinutes:item.duration_minutes||15,cue:item.cue||'',owner:item.owner_label||'',location:item.location||'',technicalCue:item.technical_cue||'',contingency:item.contingency||'',notes:item.notes||'',status:item.status||'planned'})
  useEffect(()=>{setForm({id:item.id,startTime:item.start_time?.slice(0,5)||'',durationMinutes:item.duration_minutes||15,cue:item.cue||'',owner:item.owner_label||'',location:item.location||'',technicalCue:item.technical_cue||'',contingency:item.contingency||'',notes:item.notes||'',status:item.status||'planned'})},[item])
  if(editing&&canWrite)return <article className="panel grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4"><input type="time" className="input" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/><input className="input" value={form.cue} onChange={e=>setForm({...form,cue:e.target.value})}/><input className="input" placeholder="Owner" value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/><input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input type="number" min="0" className="input" value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/><input className="input" placeholder="Technical cue" value={form.technicalCue} onChange={e=>setForm({...form,technicalCue:e.target.value})}/><input className="input" placeholder="Contingency" value={form.contingency} onChange={e=>setForm({...form,contingency:e.target.value})}/><select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Planned</option><option value="ready">Ready</option><option value="live">Live</option><option value="complete">Complete</option><option value="at_risk">At risk</option></select><textarea className="input min-h-20 md:col-span-2 xl:col-span-4" placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><div className="flex gap-2 md:col-span-2 xl:col-span-4"><button className="btn-primary" onClick={async()=>{if(await save(form))setEditing(false)}}>Save cue</button><button className="btn-secondary" onClick={()=>setEditing(false)}>Cancel</button></div></article>
  return <article className="panel p-5"><div className="grid gap-4 md:grid-cols-[90px_1.4fr_.8fr_.8fr_.7fr] md:items-start"><div><p className="text-[10px] font-black uppercase text-[#8a93a2]">Time</p><p className="mt-1 text-lg font-black text-[#23324a]">{item.start_time?.slice(0,5)||'TBD'}</p><p className="text-xs text-[#7a8595]">{item.duration_minutes||15} min</p></div><div><p className="text-[10px] font-black uppercase text-[#8a93a2]">Cue</p><p className="mt-1 font-black text-[#23324a]">{item.cue}</p>{item.technical_cue&&<p className="mt-1 text-xs text-[#7a8595]">Technical: {item.technical_cue}</p>}</div><div><p className="text-[10px] font-black uppercase text-[#8a93a2]">Owner</p><p className="mt-1 text-sm">{item.owner_label||'—'}</p></div><div><p className="text-[10px] font-black uppercase text-[#8a93a2]">Location</p><p className="mt-1 text-sm">{item.location||'—'}</p></div><div><p className="text-[10px] font-black uppercase text-[#8a93a2]">Status</p><p className="mt-1 text-sm font-black">{item.status}</p></div></div>{item.contingency&&<p className="mt-4 rounded-xl bg-[#fbf7ea] p-3 text-xs text-[#725d2d]"><b>Contingency:</b> {item.contingency}</p>}{item.notes&&<p className="mt-3 text-xs text-[#687386]">{item.notes}</p>}{canWrite&&<div className="mt-4 flex gap-3"><button onClick={()=>setEditing(true)} className="text-xs font-black text-[#9a7b31]">Edit</button><button onClick={()=>remove(item.id)} className="text-xs font-black text-red-700">Remove</button></div>}</article>
}
