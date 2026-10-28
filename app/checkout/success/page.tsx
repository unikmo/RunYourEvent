import { CheckCircle2, GitBranch, ShieldAlert } from 'lucide-react'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { decryptPlan } from '@/lib/plan-vault'

export const dynamic = 'force-dynamic'

export default async function SuccessPage() {
  const cookieStore = await cookies()
  const draftToken = cookieStore.get('dengine_draft')?.value
  if (!draftToken) {
    return <main className="shell py-20"><p className="eyebrow">Plan reference missing</p><h1 className="display mt-4 text-4xl font-black">We cannot identify the purchased event plan in this browser.</h1><p className="mt-4 max-w-2xl text-[#687386]">Return to the event builder in the browser where checkout was started, or contact hello@runyourevent.com with the Stripe receipt email.</p></main>
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('dengine_get_paid_draft', { p_draft_token: draftToken })
  const row = Array.isArray(data) ? data[0] : data

  if (error) {
    console.error('Paid-plan lookup failed', error)
    return <main className="shell py-20"><p className="eyebrow">Verification error</p><h1 className="display mt-4 text-4xl font-black">Your payment could not be verified right now.</h1><p className="mt-4 text-[#687386]">We cannot confirm the payment state while verification is unavailable. Please retry or contact hello@runyourevent.com with your earlier receipt.</p></main>
  }

  if (!row) {
    return <main className="shell py-20"><p className="eyebrow">Payment verification</p><h1 className="display mt-4 text-4xl font-black">No verified legacy purchase is available yet.</h1><p className="mt-4 max-w-2xl text-[#687386]">The plan unlocks only after RunYourEvent receives and verifies Stripe&apos;s signed payment event. Refresh this page shortly.</p><a href="/checkout/success" className="btn-primary mt-7">Check payment again →</a></main>
  }

  const tier = row.paid_tier === 'professional' ? 'professional' : 'essential'
  const plan = decryptPlan({ plan_ciphertext: row.plan_ciphertext, plan_iv: row.plan_iv, plan_tag: row.plan_tag }) as any
  const tasks = Array.isArray(plan.tasks) ? plan.tasks : []
  const groups = new Map<string, any[]>()
  tasks.forEach((task:any) => {
    const name = task.workstream || task.sub_project || 'Event Operations'
    groups.set(name, [...(groups.get(name) || []), task])
  })

  return <main className="bg-[#fbfaf7] pb-24">
    <section className="border-b border-black/[0.055] bg-[#15233f] text-white"><div className="shell py-14 sm:py-18">
      <div className="flex items-center gap-3 text-[#efcd6d]"><CheckCircle2 size={22}/><span className="text-xs font-black uppercase tracking-[0.14em]">Payment confirmed</span></div>
      <h1 className="display mt-4 text-4xl font-black sm:text-5xl">{plan.event?.name || 'Your event'} execution plan</h1>
      <p className="mt-4 max-w-3xl text-white/60">{tier === 'professional' ? 'Professional execution intelligence unlocked: dependencies, approvals, risks, contingencies and critical-path detail.' : 'Essential execution plan unlocked: complete task coverage, owners, timing, dependencies and completion criteria.'}</p>
      <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-white/65"><span className="rounded-full bg-white/10 px-3 py-2">{tasks.length} tasks</span><span className="rounded-full bg-white/10 px-3 py-2">{groups.size} workstreams</span><span className="rounded-full bg-white/10 px-3 py-2">{tier === 'professional' ? '$39 Professional' : '$19 Essential'}</span></div>
      <form action="/api/workspaces/provision" method="post" className="mt-7"><button type="submit" className="btn-signal">Open live execution workspace →</button></form>
      <p className="mt-3 max-w-2xl text-xs text-white/45">Track completion, assign collaborators, replan dependencies and run event day from the same operating model.</p>
    </div></section>
    <div className="shell mt-10 space-y-8">
      {Array.from(groups.entries()).map(([workstream, items]) => <section key={workstream} className="overflow-hidden rounded-[28px] border border-black/[0.055] bg-white">
        <div className="flex items-center gap-3 border-b border-black/[0.055] bg-[#f5f2ea] px-6 py-5"><GitBranch size={17} className="text-[#9a7b31]"/><h2 className="text-lg font-black text-[#23324a]">{workstream}</h2><span className="ml-auto text-xs font-bold text-[#8a93a2]">{items.length} items</span></div>
        <div className="divide-y divide-black/[0.055]">{items.map((task:any, i:number) => <article key={task.id || `${workstream}-${i}`} className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-base font-black text-[#23324a]">{task.title}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-[#707b8c]">{task.description || task.definition_of_done}</p></div>{task.critical_path && <span className="shrink-0 rounded-full bg-[#f4ecd6] px-3 py-1 text-[10px] font-black text-[#80631f]">Critical path</span>}</div>
          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4"><div className="metric"><b>Owner</b><p className="mt-1">{task.who || 'Event team'}</p></div><div className="metric"><b>Target</b><p className="mt-1">{task.target_date || (task.weeks_before_event != null ? `${task.weeks_before_event}w before event` : 'Sequence-driven')}</p></div><div className="metric"><b>Depends on</b><p className="mt-1">{Array.isArray(task.depends_on) && task.depends_on.length ? task.depends_on.join(', ') : 'No hard dependency'}</p></div><div className="metric"><b>Done when</b><p className="mt-1">{task.completion_criteria || task.definition_of_done}</p></div></div>
          {tier === 'professional' && (task.approval_required || task.risk_level || task.contingency) && <div className="mt-4 rounded-2xl border border-[#eadfbd] bg-[#fbf7ea] p-4 text-xs leading-5 text-[#725d2d]"><div className="flex gap-2"><ShieldAlert size={15} className="mt-0.5 shrink-0"/><div>{task.approval_required && <p><b>Approval:</b> {task.approver || 'Required approver'}</p>}{task.risk_level && <p><b>Risk:</b> {task.risk_level} — {task.risk_if_missed || 'Review impact before execution.'}</p>}{task.contingency && <p><b>Contingency:</b> {task.contingency}</p>}{task.vendor_scope && <p><b>Vendor scope:</b> {task.vendor_scope}</p>}</div></div></div>}
        </article>)}</div>
      </section>)}
    </div>
  </main>
}
