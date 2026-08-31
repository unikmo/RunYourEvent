import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic='force-dynamic'

function money(cents:number){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((cents||0)/100)}
function label(segment:string){return ({company:'Company events',weddings:'Weddings',family_reunions:'Family reunions',secondary:'Secondary organic',other:'Other'} as Record<string,string>)[segment]||segment}

export default async function AdminPage(){
  const session=await getAdminSession(); if(!session) redirect('/admin/login')
  const db=createServerClient()
  const {data,error}=await db.rpc('rye_admin_dashboard',{p_token:session.token})
  if(error||!data) redirect('/admin/login')
  const metrics=(data as any).metrics||{}
  const segments=(data as any).segments||[]
  const orders=(data as any).orders||[]
  const drafts=(data as any).drafts||[]
  const workspaces=(data as any).workspaces||[]
  const activity=(data as any).activity||[]
  return <main className="min-h-screen bg-[#f5f2ea]"><section className="shell py-10 sm:py-14">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">RunYourEvent operations</p><h1 className="display mt-3 text-4xl font-black sm:text-5xl">Admin dashboard</h1><p className="mt-3 text-sm text-[#687386]">Demand, revenue, workspace activity and segment performance in one place.</p></div><div className="flex flex-wrap gap-3"><a href="/admin/volunteer-engine" className="btn-primary">Volunteer Engine</a><form action="/api/admin/logout" method="post"><button className="btn-secondary" type="submit">Sign out</button></form></div></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{[['Previews · 7d',metrics.previews7d||0],['Checkouts · 7d',metrics.checkouts7d||0],['Paid · 30d',metrics.paid30d||0],['Revenue · 30d',money(metrics.revenue30d||0)],['Active workspaces',metrics.activeWorkspaces||0],['Collaborators',metrics.workspaceMembers||0]].map(([k,v])=><div key={String(k)} className="panel p-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8c7440]">{k}</p><p className="mt-2 text-2xl font-black text-[#23324a]">{v}</p></div>)}</div>
    <section className="mt-8 panel overflow-hidden"><div className="border-b p-6"><p className="eyebrow">Primary funnel split</p><h2 className="mt-2 text-2xl font-black text-[#23324a]">Company → Weddings → Family reunions</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-[.11em] text-[#8b94a2]"><tr><th className="p-4">Segment</th><th className="p-4">Previews · 30d</th><th className="p-4">Orders · 30d</th><th className="p-4">Paid · 30d</th><th className="p-4">Revenue · 30d</th></tr></thead><tbody>{segments.map((x:any)=><tr key={x.segment} className="border-t"><td className="p-4 font-black text-[#23324a]">{label(x.segment)}</td><td className="p-4">{x.previews}</td><td className="p-4">{x.orders}</td><td className="p-4">{x.paid}</td><td className="p-4 font-black">{money(x.revenue)}</td></tr>)}</tbody></table></div></section>
    <div className="mt-8 grid gap-6 xl:grid-cols-2"><section className="panel overflow-hidden"><div className="p-6"><p className="eyebrow">Workspaces</p><h2 className="mt-2 text-xl font-black text-[#23324a]">Live execution environments</h2></div><div className="divide-y">{workspaces.map((w:any)=><div key={w.id} className="p-5"><div className="flex justify-between gap-4"><div><p className="font-black text-[#23324a]">{w.name}</p><p className="mt-1 text-xs text-[#7a8595]">{label(w.event_segment)} · {w.event_date||'No date'} · {w.tier}</p></div><span className="text-[10px] font-black uppercase text-[#9a7b31]">{w.status}</span></div></div>)}</div></section>
    <section className="panel overflow-hidden"><div className="p-6"><p className="eyebrow">Orders</p><h2 className="mt-2 text-xl font-black text-[#23324a]">Latest checkout activity</h2></div><div className="divide-y">{orders.map((o:any)=><div key={o.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-black text-[#23324a]">{o.customer_email||'Email pending'}</p><p className="mt-1 text-xs text-[#7a8595]">{label(o.event_segment)} · {o.tier} · {new Date(o.created_at).toLocaleString()}</p></div><div className="text-right"><p className="font-black">{money(o.amount_cents)}</p><p className={`mt-1 text-[10px] font-black uppercase ${o.status==='paid'?'text-green-700':'text-[#9a7b31]'}`}>{o.status}</p></div></div></div>)}</div></section></div>
    <div className="mt-8 grid gap-6 xl:grid-cols-2"><section className="panel overflow-hidden"><div className="p-6"><p className="eyebrow">Generated plans</p></div><div className="divide-y">{drafts.map((d:any)=><div key={d.draft_token} className="p-4"><p className="font-black text-[#23324a]">{d.event_summary?.name||'Untitled event'}</p><p className="mt-1 text-xs text-[#7a8595]">{label(d.event_segment)} · {d.event_summary?.eventDate||'No date'} · {d.recommended_tier}</p></div>)}</div></section>
    <section className="panel overflow-hidden"><div className="p-6"><p className="eyebrow">Conversion activity</p></div><div className="divide-y">{activity.map((a:any)=><div key={a.id} className="grid gap-1 p-4 text-sm sm:grid-cols-[170px_150px_1fr]"><b>{a.event_name}</b><span className="text-[#8b7440]">{label(a.event_segment)}</span><span className="text-[#7a8595]">{new Date(a.created_at).toLocaleString()}</span></div>)}</div></section></div>
  </section></main>
}
