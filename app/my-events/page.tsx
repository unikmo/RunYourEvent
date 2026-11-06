import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { hashWorkspaceToken, WORKSPACE_COOKIE_PREFIX } from '@/lib/workspace-auth'

export const dynamic='force-dynamic'
export const metadata={robots:{index:false,follow:false}}

export default async function MyEventsPage(){
  const store=await cookies();const db=createServerClient();const entries=store.getAll().filter(c=>c.name.startsWith(WORKSPACE_COOKIE_PREFIX))
  const workspaces:any[]=[]
  for(const entry of entries){
    const id=entry.name.slice(WORKSPACE_COOKIE_PREFIX.length)
    const {data,error}=await db.rpc('rye_get_workspace',{p_workspace_id:id,p_access_hash:hashWorkspaceToken(entry.value)})
    if(!error&&data?.workspace)workspaces.push(data)
  }
  return <main className="min-h-[70vh] bg-[#f5f2ea]"><section className="shell py-8"><p className="eyebrow">Your RunYourEvent workspaces</p><h2 className="page-title mt-4">My events</h2><p className="mt-4 max-w-2xl text-[#687386]">Events available in this browser. Secure collaborator links can add additional event workspaces here.</p><div className="mt-6 grid gap-5 md:grid-cols-2">{workspaces.map((x:any)=>{const m=x.metrics||{};const readiness=m.total?Math.round((m.done/m.total)*100):0;return <a key={x.workspace.id} href={`/workspace/${x.workspace.id}`} className="panel p-6 transition hover:-translate-y-0.5"><div className="flex justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#9a7b31]">{x.workspace.tier} · {x.role}</p><h3 className="mt-2 text-2xl font-black text-[#23324a]">{x.workspace.name}</h3><p className="mt-2 text-sm text-[#687386]">{x.workspace.event_date||'Date not set'} · {m.done||0}/{m.total||0} tasks complete</p></div><p className="text-3xl font-black text-[#9a7b31]">{readiness}%</p></div></a>})}</div>{workspaces.length===0&&<div className="panel mt-6 p-7"><h3 className="text-xl font-black text-[#23324a]">No event workspaces in this browser yet.</h3><p className="mt-3 text-sm text-[#687386]">Build and purchase an execution plan, then open its live workspace.</p><a href="/custom" className="btn-primary mt-5">Build my event plan</a></div>}</section></main>
}
