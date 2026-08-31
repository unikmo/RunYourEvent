import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic='force-dynamic'

function hours(minutes:number){return `${((minutes||0)/60).toFixed(1)}h`}
function pipeline(value:string){return value==='sports_club'?'Sports season':'One-off event'}

export default async function VolunteerAdminPage(){
  const session=await getAdminSession(); if(!session) redirect('/admin/login')
  const db=createServerClient()
  const {data,error}=await db.rpc('rye_admin_volunteer_dashboard',{p_token:session.token})
  if(error||!data) redirect('/admin/login')
  const metrics=(data as any).metrics||{}
  const organizers=(data as any).organizers||[]
  const volunteers=(data as any).volunteers||[]
  const placements=(data as any).placements||[]

  return <main className="min-h-screen bg-[#f5f2ea]"><section className="shell py-10 sm:py-14">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">RunYourEvent operations</p><h1 className="display mt-3 text-4xl font-black sm:text-5xl">Volunteer Engine</h1><p className="mt-3 text-sm text-[#687386]">Organizer demand, volunteer pool, placements and certificate progress.</p></div><div className="flex gap-3"><a href="/admin" className="btn-secondary">Core dashboard</a><form action="/api/admin/logout" method="post"><button className="btn-secondary" type="submit">Sign out</button></form></div></div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[['Organizer leads · 7d',metrics.organizerLeads7d||0],['New volunteers · 30d',metrics.volunteers30d||0],['Open shifts',metrics.openOpportunities||0],['Confirmed / completed',metrics.confirmedPlacements||0],['Certificate eligible',metrics.certificateEligible||0]].map(([k,v])=><div key={String(k)} className="panel p-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#8c7440]">{k}</p><p className="mt-2 text-2xl font-black text-[#23324a]">{v}</p></div>)}</div>

    <section className="mt-8 panel overflow-hidden"><div className="border-b p-6"><p className="eyebrow">Organizer pipeline</p><h2 className="mt-2 text-2xl font-black text-[#23324a]">Latest volunteer requirements</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-[.11em] text-[#8b94a2]"><tr><th className="p-4">Organization</th><th className="p-4">Contact</th><th className="p-4">Model</th><th className="p-4">Event / season</th><th className="p-4">Need</th><th className="p-4">Status</th></tr></thead><tbody>{organizers.map((x:any)=><tr key={x.id} className="border-t"><td className="p-4"><p className="font-black text-[#23324a]">{x.organization_name}</p><p className="mt-1 text-xs text-[#7a8595]">{x.city}</p></td><td className="p-4"><p>{x.contact_name}</p><p className="mt-1 text-xs text-[#7a8595]">{x.contact_email}</p></td><td className="p-4">{pipeline(x.pipeline)}</td><td className="p-4">{x.event_name||x.season_label||x.event_date||'—'}</td><td className="p-4 font-black">{x.volunteers_needed}</td><td className="p-4 text-[10px] font-black uppercase text-[#9a7b31]">{x.status}</td></tr>)}</tbody></table></div></section>

    <section className="mt-8 panel overflow-hidden"><div className="border-b p-6"><p className="eyebrow">Volunteer pool</p><h2 className="mt-2 text-2xl font-black text-[#23324a]">Profiles & verified progress</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-[.11em] text-[#8b94a2]"><tr><th className="p-4">Volunteer</th><th className="p-4">Location</th><th className="p-4">Age</th><th className="p-4">Credited</th><th className="p-4">Points</th><th className="p-4">Days</th><th className="p-4">Certificate</th></tr></thead><tbody>{volunteers.map((x:any)=><tr key={x.id} className="border-t"><td className="p-4"><p className="font-black text-[#23324a]">{x.first_name} {x.last_name}</p><p className="mt-1 text-xs text-[#7a8595]">{x.email}</p></td><td className="p-4">{x.city}</td><td className="p-4">{String(x.age_band||'').replace('_','–')}</td><td className="p-4">{hours(x.credited_minutes)}</td><td className="p-4 font-black">{x.points||0}</td><td className="p-4">{x.distinct_event_days||0}</td><td className={`p-4 text-[10px] font-black uppercase ${x.certificate_eligible?'text-green-700':'text-[#8b94a2]'}`}>{x.certificate_eligible?'Eligible':'Building'}</td></tr>)}</tbody></table></div></section>

    <section className="mt-8 panel overflow-hidden"><div className="border-b p-6"><p className="eyebrow">Placements</p><h2 className="mt-2 text-2xl font-black text-[#23324a]">Latest shift activity</h2></div><div className="divide-y">{placements.length?placements.map((x:any)=><div key={x.id} className="grid gap-2 p-5 text-sm sm:grid-cols-[1.2fr_1fr_120px_100px]"><div><p className="font-black text-[#23324a]">{x.opportunity_title}</p><p className="text-xs text-[#7a8595]">{x.organization_name}</p></div><p>{x.first_name} {x.last_name}</p><p>{x.event_day}</p><p className="text-[10px] font-black uppercase text-[#9a7b31]">{x.status}</p></div>):<p className="p-6 text-sm text-[#7a8595]">No placements recorded yet.</p>}</div></section>
  </section></main>
}
