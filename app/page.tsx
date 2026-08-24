import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

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
  ['01', 'Describe the event', 'Tell us what is happening, when it happens and the constraints that matter.'],
  ['02', 'Get the execution plan', 'RunYourEvent builds the workstreams, tasks, owners, dependencies and deadlines.'],
  ['03', 'Run the event', 'Assign the work, track readiness and replan when reality changes.'],
]

const audiences = [
  ['Company events', 'Give every workstream an owner and every deadline visibility.', '/company-event-planning'],
  ['Event teams & agencies', 'Standardize execution without forcing every event into the same template.', '/agencies'],
  ['Weddings & private events', 'Know exactly what needs to happen next—and who owns it.', '/wedding-planning-checklist'],
  ['Hotels & venues', 'Coordinate clients, suppliers and internal teams from one operating plan.', '/venues'],
]

const plans = [
  ['Free preview', '$0', 'See the event architecture, complexity and recommended execution tier before paying.'],
  ['Essential', '$19', 'A complete execution plan for a straightforward event. No subscription.'],
  ['Professional', '$39', 'Deeper approvals, risks, contingencies, vendors and critical-path control.'],
]

export default function HomePage() {
  return (
    <main className="bg-[#fcfbf8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <section className="border-b border-black/[0.06]">
        <div className="shell grid min-h-[680px] items-center gap-14 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <div>
            <p className="eyebrow">Event Execution Platform</p>
            <h1 className="hero-title mt-5">Run your entire event without losing track of anything.</h1>
            <p className="lede mt-7">Turn your event into clear workstreams, tasks, owners, dependencies and deadlines—from first decision to final delivery.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/custom" className="btn-primary">Build my event plan <ArrowRight className="ml-2" size={16} /></a>
              <a href="#how-it-works" className="btn-secondary">See how it works</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#707b8c]">
              {['Free preview', 'Plans from $19/event', 'No subscription required'].map(item => (
                <span key={item} className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />{item}</span>
              ))}
            </div>
          </div>

          <div className="panel overflow-hidden" aria-label="Example RunYourEvent execution workspace">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#15233f] px-6 py-5 text-white">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/45">Customer conference</p>
                <p className="mt-1 font-black">Berlin · 350 guests</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/45">Readiness</p>
                <p className="mt-1 text-2xl font-black text-[#e7c66f]">72%</p>
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <div className="grid grid-cols-4 gap-4 border-b border-black/[0.07] pb-6">
                {[['Tasks', '47'], ['Streams', '7'], ['Blocked', '2'], ['Approvals', '4']].map(([label, value]) => (
                  <div key={label} className="metric">
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8a93a2]">{label}</p>
                    <p className="mt-1 text-lg font-black text-[#15233f]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="pt-5">
                <div className="flex items-center justify-between pb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8a671b]">
                  <span>Critical sequence</span><span>Status</span>
                </div>
                <div className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
                  {[
                    ['Venue confirmed', 'Done'],
                    ['Floorplan approved', 'Late'],
                    ['AV quantities locked', 'Blocked'],
                    ['Technical rehearsal', 'Ready next'],
                  ].map(([task, status]) => (
                    <div key={task} className="flex items-center justify-between gap-5 py-4">
                      <span className="text-sm font-bold text-[#24324a]">{task}</span>
                      <span className="text-xs font-extrabold text-[#7b6841]">{status}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-[#667184]">When the floorplan slips, RunYourEvent exposes the downstream work that now needs attention.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-pad bg-white">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title mt-4">From event idea to executable operating plan.</h2>
          </div>
          <div className="mt-12 grid border-y border-black/[0.07] md:grid-cols-3">
            {steps.map(([number, title, body], index) => (
              <article key={title} className={`py-8 md:px-8 ${index > 0 ? 'border-t border-black/[0.07] md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
                <p className="text-xs font-black tracking-[0.12em] text-[#9a741c]">{number}</p>
                <h3 className="mt-5 text-xl font-black tracking-[-0.025em] text-[#15233f]">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#667184]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#15233f] text-white">
        <div className="shell grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e7c66f]">One event. One operating model.</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">See what changes before it becomes an event-day problem.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/62">A static checklist remembers work. RunYourEvent connects the work so a delay, approval or dependency has visible consequences.</p>
          </div>
          <div className="border-y border-white/12">
            {[
              ['Floorplan approval', 'moves +4 days'],
              ['AV quantities', 'cannot lock yet'],
              ['Vendor purchase order', 'moves downstream'],
              ['Technical rehearsal', 'buffer becomes visible'],
            ].map(([left, right], index) => (
              <div key={left} className={`grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center ${index > 0 ? 'border-t border-white/10' : ''}`}>
                <p className="font-bold text-white/88">{left}</p>
                <p className="text-sm font-extrabold text-[#e7c66f]">{right}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#f4f1e9]">
        <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="eyebrow">Built for real event work</p>
            <h2 className="section-title mt-4">Different events. The same need for control.</h2>
          </div>
          <div className="rule-list bg-transparent">
            {audiences.map(([title, body, href]) => (
              <a key={title} href={href} className="group grid gap-3 py-6 sm:grid-cols-[.72fr_1.28fr_auto] sm:items-center">
                <h3 className="text-lg font-black tracking-[-0.02em] text-[#15233f]">{title}</h3>
                <p className="text-sm leading-6 text-[#667184]">{body}</p>
                <ArrowRight size={16} className="text-[#9a741c] transition-transform duration-150 group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow">Simple event pricing</p>
            <h2 className="section-title mt-4">Start free. Pay once when you need the complete plan.</h2>
          </div>
          <div className="mt-12 grid border-y border-black/[0.07] md:grid-cols-3">
            {plans.map(([name, price, copy], index) => (
              <article key={name} className={`py-8 md:px-8 ${index > 0 ? 'border-t border-black/[0.07] md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
                <p className="text-sm font-black text-[#15233f]">{name}</p>
                <p className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#101827]">{price}</p>
                <p className="mt-4 max-w-sm text-sm leading-6 text-[#667184]">{copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/custom" className="btn-primary">Build my event plan <ArrowRight className="ml-2" size={16} /></a>
            <a href="/pricing" className="text-link">Compare plans</a>
            <span className="text-sm text-[#7b8493]">Teams & agencies: custom access available.</span>
          </div>
        </div>
      </section>
    </main>
  )
}
