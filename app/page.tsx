import type { Metadata } from 'next'
import { ArrowRight, Check, CircleAlert, Clock3, GitBranch, UserRound } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RunYourEvent | Event Execution Platform',
  description: 'Turn your event into clear workstreams, tasks, owners, dependencies and deadlines—from first decision to final delivery.',
  alternates: { canonical: '/' },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RunYourEvent',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://runyourevent.com',
  description: 'Event execution platform for turning fixed-date events into connected operating plans with owners, dependencies, approvals, risks, readiness and Run of Show.',
  offers: { '@type': 'AggregateOffer', lowPrice: '19', highPrice: '39', priceCurrency: 'USD', offerCount: '2' },
}

const steps = [
  ['01', 'Plan', 'Describe the event, the fixed date and what must become true before guests arrive.'],
  ['02', 'Connect', 'Turn the work into owners, dependencies, approvals and deadlines that move together.'],
  ['03', 'Execute', 'Track readiness, expose blockers and run event day from the same operating model.'],
]

const audiences = [
  ['Company events', 'Cross-functional execution across venue, program, guests, suppliers and approvals.', '/company-event-planning'],
  ['Event teams & agencies', 'A repeatable execution system without forcing every event into the same template.', '/agencies'],
  ['Weddings & private events', 'Clear ownership, sequencing and day-of control for a fixed date that cannot move.', '/wedding-planning-checklist'],
  ['Hotels & venues', 'Coordinate clients, suppliers and internal teams around one live operating plan.', '/venues'],
]

const plans = [
  ['Free preview', '$0', 'See the event architecture, complexity and recommended execution tier.'],
  ['Essential', '$19', 'A complete execution plan for a genuinely straightforward event.'],
  ['Professional', '$39', 'Deeper approvals, risk, contingencies, vendors and critical-path control.'],
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <section className="relative isolate border-b border-black/[0.06] bg-[#f7f5ef]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-24 text-center sm:py-32 lg:py-36">
          <p className="eyebrow">Event Execution Platform</p>
          <h1 className="premium-hero mx-auto mt-7 max-w-[1050px]">Your event.<br />Every dependency.<br /><span className="text-[#9a741c]">Under control.</span></h1>
          <p className="mx-auto mt-8 max-w-[700px] text-[18px] leading-8 text-[#646f80] sm:text-xl">RunYourEvent turns a fixed date into a live operating plan—so everyone knows what happens next, who owns it and what changes when reality moves.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="/custom" className="btn-primary">Build my event plan <ArrowRight className="ml-2" size={16} /></a>
            <a href="#product" className="btn-secondary">See the product</a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm font-semibold text-[#717a88]">
            {['Free preview', 'Complete plans from $19', 'No subscription required'].map(item => (
              <span key={item} className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="relative bg-[#0e1729] py-20 sm:py-28 lg:py-32 text-white">
        <div className="shell">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">One view. Every moving part.</p>
            <h2 className="mt-5 text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">The control layer between planning and execution.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/58">Not another checklist. A connected operating model that shows ownership, readiness, dependencies and the consequences of change.</p>
          </div>

          <div className="product-stage mt-14 sm:mt-16" aria-label="Example RunYourEvent execution workspace">
            <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/35">Customer conference · Berlin</p>
                <p className="mt-1 text-lg font-black tracking-[-0.02em]">350 guests · Event day in 41 days</p>
              </div>
              <div className="flex gap-8 sm:text-right">
                <div><p className="text-[9px] uppercase tracking-[0.12em] text-white/35">Readiness</p><p className="mt-1 text-2xl font-black text-[#e7c66f]">72%</p></div>
                <div><p className="text-[9px] uppercase tracking-[0.12em] text-white/35">Critical</p><p className="mt-1 text-2xl font-black">3</p></div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[.78fr_1.22fr]">
              <div className="border-b border-white/10 p-5 sm:p-8 lg:border-b-0 lg:border-r">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#d9b95d]">Execution overview</p>
                <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8">
                  {[
                    ['47', 'Tasks'],
                    ['7', 'Workstreams'],
                    ['4', 'Approvals'],
                    ['2', 'Blocked'],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-4xl font-black tracking-[-0.04em]">{value}</p>
                      <p className="mt-1 text-xs font-bold text-white/42">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-9 border-t border-white/10 pt-6">
                  <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 shrink-0 text-[#e7c66f]" size={17} /><p className="text-sm leading-6 text-white/64">Floorplan approval moved four days. Two downstream tasks now need attention.</p></div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/36">Critical sequence</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/36">Owner · status</p>
                </div>
                <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
                  {[
                    ['Venue confirmed', 'Mara', 'Done', Check],
                    ['Floorplan approved', 'Jonas', 'Late', Clock3],
                    ['AV quantities locked', 'Amina', 'Blocked', GitBranch],
                    ['Technical rehearsal', 'Leo', 'Ready next', UserRound],
                  ].map(([task, owner, status, Icon]: any) => (
                    <div key={task} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="flex items-center gap-3"><Icon size={15} className="shrink-0 text-[#d9b95d]" /><p className="font-bold text-white/88">{task}</p></div>
                      <p className="text-sm font-bold text-white/46">{owner} · <span className="text-[#e7c66f]">{status}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f7f5ef] py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow">Three moves</p>
              <h2 className="premium-section mt-5">Plan it.<br />Connect it.<br />Run it.</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#646f80] lg:pb-2">The interface stays quiet because the work is not. RunYourEvent surfaces complexity only when it changes the next decision.</p>
          </div>

          <div className="mt-14 grid border-y border-black/[0.08] md:grid-cols-3">
            {steps.map(([number, title, body], index) => (
              <article key={title} className={`py-8 md:px-9 md:py-10 ${index > 0 ? 'border-t border-black/[0.08] md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
                <p className="text-xs font-black tracking-[0.16em] text-[#9a741c]">{number}</p>
                <h3 className="mt-8 text-2xl font-black tracking-[-0.03em] text-[#111827]">{title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-6 text-[#697382]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-36">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow">Small change. Large consequence.</p>
              <h2 className="premium-section mt-5 max-w-xl">See what breaks before event day.</h2>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#667184]">A static checklist remembers work. RunYourEvent understands the sequence behind the work, so a late decision becomes visible before it becomes a live-event failure.</p>
            </div>
            <div className="border-y border-black/[0.08]">
              {[
                ['Floorplan approval', '+4 days', 'Decision'],
                ['AV quantities', 'cannot lock', 'Dependency'],
                ['Vendor PO', 'moves downstream', 'Commercial'],
                ['Technical rehearsal', 'buffer reduced', 'Risk'],
              ].map(([title, value, type], index) => (
                <div key={title} className={`grid gap-2 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center ${index > 0 ? 'border-t border-black/[0.07]' : ''}`}>
                  <p className="font-black tracking-[-0.02em] text-[#182237]">{title}</p>
                  <p className="text-sm font-black text-[#9a741c]">{value}</p>
                  <p className="sm:w-24 sm:text-right text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9299a5]">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-24 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[.68fr_1.32fr]">
          <div>
            <p className="eyebrow">Built for real event work</p>
            <h2 className="premium-section mt-5">Different events.<br />Same need for control.</h2>
          </div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {audiences.map(([title, body, href]) => (
              <a key={title} href={href} className="group grid gap-3 py-6 sm:grid-cols-[.7fr_1.3fr_auto] sm:items-center">
                <h3 className="text-lg font-black tracking-[-0.025em] text-[#172033]">{title}</h3>
                <p className="text-sm leading-6 text-[#667184]">{body}</p>
                <ArrowRight size={16} className="text-[#9a741c] transition-transform duration-150 group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow">Simple event pricing</p>
              <h2 className="premium-section mt-5">Start free.<br />Pay once.</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#646f80]">No subscription for a single event. Essential stays complete for simpler events; Professional adds deeper execution control.</p>
          </div>

          <div className="mt-14 grid border-y border-black/[0.08] md:grid-cols-3">
            {plans.map(([name, price, copy], index) => (
              <article key={name} className={`py-8 md:px-9 md:py-10 ${index > 0 ? 'border-t border-black/[0.08] md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
                <p className="text-sm font-black text-[#182237]">{name}</p>
                <p className="mt-6 text-5xl font-black tracking-[-0.055em] text-[#101827]">{price}</p>
                <p className="mt-5 max-w-sm text-sm leading-6 text-[#667184]">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a href="/custom" className="btn-primary">Build my event plan <ArrowRight className="ml-2" size={16} /></a>
            <a href="/pricing" className="text-link">Compare plans</a>
            <span className="text-sm text-[#7b8493]">Teams & agencies: custom access.</span>
          </div>
        </div>
      </section>
    </main>
  )
}
