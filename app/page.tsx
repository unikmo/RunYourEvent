import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, Check, Clock3, GraduationCap, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RunYourEvent | Volunteer, Bring Your Team or Support Local Sport',
  description: 'Find local sports volunteering, bring your employee team or get the help your club needs. Community activities, employee projects and sponsorship with verified contribution.',
  alternates: { canonical: '/' },
}

const audiences = [
  ['For volunteers', 'A few hours. A useful plan.', 'Find a local activity, bring friends and build your verified contribution record.', '/activities', 'Find an activity'],
  ['For sports clubs', 'Get the help your club needs.', 'Publish matchday roles, practical projects or a whole season of volunteer needs.', '/club', 'Find volunteers'],
  ['For companies & organisations', 'Bring your employee team.', 'Give staff a meaningful team activity, from a short shift to a full-day club project.', '/corporate', 'Explore employee volunteering'],
  ['For sponsors', 'Help your community show up.', 'Fund all or part of a club’s volunteer needs and see the contribution your support enables.', '/opportunities', 'Sponsor a club'],
]
const steps = [
  ['01', 'Clubs publish real needs', 'A clear task, location, time and number of places. Community activities last 2–4 hours; employee projects can run up to eight.'],
  ['02', 'People choose and connect', 'Volunteers confirm their own places and coordinate directly with the club. Employers invite their teams through a private workspace.'],
  ['03', 'Contribution gets verified', 'Check-in, check-out and organizer approval turn completed activities into verified hours, recognition and contribution reports.'],
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section aria-labelledby="home-heading" className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative grid items-start gap-9 py-8 sm:gap-12 sm:py-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:py-14">
          <div>
            <p className="eyebrow">Local sport. Shared contribution.</p>
            <h1 id="home-heading" className="home-hero mt-4">Local sport.<br/><span className="text-[#9a741c]">Powered by people.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#646f80] sm:text-lg">Find local sports volunteering, bring your employee team, or get the help your club needs.</p>
            <div className="mt-6 flex flex-wrap gap-3" aria-label="Choose how to participate">
              <a href="/activities" className="btn-primary">Find an activity <ArrowRight className="ml-2" size={16}/></a>
              <a href="/club" className="btn-secondary">Find volunteers</a>
              <a href="/corporate" className="btn-secondary">Bring your employee team</a>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#646f80]">Employee volunteering for companies and organisations. <a href="/sponsors" className="font-bold underline underline-offset-4">You can sponsor local clubs, too.</a></p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#646f80] sm:text-sm">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>Choose your commitment</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>Build verified hours</span>
            </div>
          </div>
          <aside aria-label="Examples of volunteering" className="space-y-3 lg:pt-1">
            <article className="rounded-3xl bg-[#0e1729] p-6 text-white sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#e7c66f]">Community activity · example</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Help a matchday happen.</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">Welcome supporters, run the tournament desk or help with matchday setup.</p>
              <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/80"><span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-[#e7c66f]"/>2–4 hours</span><span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-[#e7c66f]"/>Verified contribution</span></div>
            </article>
            <article className="rounded-3xl border border-[#d5ad48]/35 bg-[#eee7d3] p-6 sm:p-7">
              <p className="eyebrow">Employee team project · example</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">A day together. A club transformed.</h2>
              <p className="mt-3 text-sm leading-6 text-[#536072]">Repaint a clubhouse or restore a club garden with your colleagues. A clear scope, supervision and verified hours.</p>
              <a href="/corporate" className="text-link mt-4"><Users size={16}/>Team projects up to 8 hours <ArrowRight size={14}/></a>
            </article>
          </aside>
        </div>
      </section>

      <section aria-label="Ways to take part" className="border-b border-black/[0.06] bg-white py-10 sm:py-14">
        <div className="shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(([label,title,copy,href,cta])=><article key={label} className="flex flex-col border-t border-[#d5ad48] pt-5"><p className="eyebrow">{label}</p><h2 className="mt-3 text-xl font-black tracking-tight">{title}</h2><p className="mt-3 text-sm leading-7 text-[#667184]">{copy}</p><a className="text-link mt-5" href={href}>{cta}<ArrowRight size={14}/></a></article>)}</div>
      </section>

      <section id="how-it-works" className="bg-[#f7f5ef] py-14 sm:py-20">
        <div className="shell"><p className="eyebrow">How it works</p><h2 className="premium-section mt-4 max-w-3xl">From a club need to a contribution that counts.</h2><div className="mt-9 grid gap-8 md:grid-cols-3">{steps.map(([n,title,copy])=><article key={n} className="border-t border-black/10 pt-5"><p className="eyebrow">{n}</p><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-[#667184]">{copy}</p></article>)}</div></div>
      </section>

      <section id="employee-volunteering" className="bg-[#0e1729] py-14 text-white sm:py-20">
        <div className="shell grid gap-9 lg:grid-cols-2 lg:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#e7c66f]">For companies & organisations</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-.04em] sm:text-4xl">Your employees bring the energy.<br/>Local clubs bring a real need.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/70">Bring a group of colleagues to a practical club project. From painting a clubhouse to restoring a garden, choose a useful commitment of up to eight hours.</p><a href="/corporate" className="btn-signal mt-6">Plan employee volunteering <ArrowRight size={16} className="ml-2"/></a></div><div className="divide-y divide-white/15 border-y border-white/15">{[['A clear project','Agree tasks, team size, supervision, materials and the project price before booking.'],['Your team coordinates on-platform','Invite employees, let each person confirm and keep arrangements in the workspace.'],['Verified participation','Actual completed hours are approved by the club and reflected in the company’s contribution report.']].map(([title,copy])=><div key={title} className="py-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-white/65">{copy}</p></div>)}</div></div>
      </section>

      <section id="fees-and-recognition" className="py-14 sm:py-20">
        <div className="shell grid items-start gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-black/[0.07] bg-white p-7 sm:p-9"><p className="eyebrow">Clear club fees</p><h2 className="mt-4 text-4xl font-black tracking-tight">€10 <span className="text-base font-semibold tracking-normal text-[#667184]">per completed volunteer</span></h2><p className="mt-4 text-sm leading-7 text-[#667184]">The club placement fee applies after completed attendance is verified. Eligible sponsorship can cover this fee.</p><div className="mt-5 divide-y divide-black/[0.07] border-y border-black/[0.07] text-sm text-[#536072]"><p className="py-3"><b>Posting, invitations and acceptance:</b> free</p><p className="py-3"><b>No-show:</b> no placement fee</p><p className="py-3"><b>Employee team projects:</b> separately quoted</p></div><p className="mt-4 text-xs leading-6 text-[#667184]">Materials, protection and applicable taxes are disclosed separately.</p><a href="/pricing" className="text-link mt-5">See pricing details <ArrowRight size={14}/></a></article>
          <article className="rounded-3xl bg-[#eee7d3] p-7 sm:p-9"><p className="eyebrow">Recognition for every volunteer</p><GraduationCap className="mt-5 text-[#9a741c]" size={30}/><h2 className="mt-4 text-3xl font-black tracking-tight">Your contribution comes with you.</h2><p className="mt-4 text-sm leading-7 text-[#536072]">Build verified hours across clubs and activities. Earn Bronze at 20 hours, Silver at 40 and Gold at 60, with hand-signed Gold certificates.</p><p className="mt-4 text-sm leading-7 text-[#536072]">Choose to share your volunteer page and join the city, country or worldwide Champsboard.</p><div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#536072]"><ShieldCheck size={17}/>Check-in, check-out and club verification</div><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3"><a href="/recognition" className="text-link">Explore recognition <ArrowRight size={14}/></a><a href="/champsboard" className="text-link">See the Champsboard <ArrowRight size={14}/></a></div></article>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white py-14 sm:py-20"><div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow">Make a plan for the weekend</p><h2 className="premium-section mt-4 max-w-3xl">Bring your friends.<br/>Give four hours.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-[#667184]">Choose an activity, share it with your friends and make a useful day of it. Each person confirms their own place and builds their own contribution record.</p></div><a href="/activities" className="btn-primary">Find an activity <ArrowRight className="ml-2" size={16}/></a></div></section>
    </main>
  )
}
