import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'RunYourEvent Pricing | Event Plans & Volunteer Engine' },
  description: 'Event execution plans from $19 plus Volunteer Engine recruitment: €200 per sports season, success-based one-off placement fees and conditional Volunteer Protection Plus.',
  alternates: { canonical: '/pricing' },
}

const plans = [
  {
    name: 'Preview',
    price: '$0',
    eyebrow: 'Start here',
    copy: 'Confirm that RunYourEvent understands your event before paying.',
    features: ['Event architecture summary', 'Representative execution tasks', 'Complexity assessment', 'Tier recommendation'],
    cta: 'Build free preview',
  },
  {
    name: 'Essential',
    price: '$19',
    suffix: '/ event',
    eyebrow: 'Straightforward events',
    copy: 'A complete, right-sized execution plan for a genuinely simpler event.',
    features: ['Complete task coverage', 'Owners and backward timing', 'Dependencies', 'Completion criteria', 'Event-date anchored schedule', 'No subscription'],
    cta: 'Build my event plan',
  },
  {
    name: 'Professional',
    price: '$39',
    suffix: '/ event',
    eyebrow: 'Complex delivery',
    copy: 'Adds deeper control when approvals, risks, suppliers and critical paths matter.',
    features: ['Everything in Essential', 'Approval gates + approvers', 'Risk consequences', 'Contingencies', 'Critical-path detail', 'Vendor/procurement scope'],
    cta: 'Build my event plan',
  },
]

export default function PricingPage() {
  return (
    <main className="bg-[#f7f5ef]">
      <section className="relative isolate overflow-hidden border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-24 text-center sm:py-32">
          <p className="eyebrow">Pricing</p>
          <h1 className="premium-hero mx-auto mt-7 max-w-5xl">Start free.<br /><span className="text-[#9a741c]">Pay for what you use.</span></h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#646f80]">Event execution plans are priced per event. Volunteer Engine recruitment uses a separate season or successful-placement model.</p>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <p className="eyebrow">Event execution plans</p>
          <div className="mt-8 grid border-y border-black/[0.08] lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article key={plan.name} className={`flex flex-col py-9 lg:px-9 lg:py-11 ${index > 0 ? 'border-t border-black/[0.08] lg:border-l lg:border-t-0' : ''} ${index === 0 ? 'lg:pl-0' : ''}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8a671b]">{plan.eyebrow}</p>
                <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#182237]">{plan.name}</h2>
                <p className="mt-7 text-6xl font-black tracking-[-0.06em] text-[#101827]">{plan.price} {plan.suffix && <span className="text-sm font-bold tracking-normal text-[#89919d]">{plan.suffix}</span>}</p>
                <p className="mt-6 max-w-sm text-sm leading-6 text-[#667184]">{plan.copy}</p>
                <ul className="mt-8 flex-1 divide-y divide-black/[0.07] border-y border-black/[0.07]">
                  {plan.features.map(feature => <li key={feature} className="flex gap-3 py-3.5 text-sm text-[#3f4a5c]"><Check size={14} className="mt-0.5 shrink-0 text-[#a47b1c]" /><span>{feature}</span></li>)}
                </ul>
                <a className="btn-primary mt-8 w-full" href="/custom">{plan.cta}<ArrowRight className="ml-2" size={15} /></a>
              </article>
            ))}
          </div>

          <div className="mt-16 grid gap-8 border-y border-black/[0.08] py-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow">Teams & agencies</p><h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#182237]">Repeat event operations need a different model.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[#667184]">Concurrent events, reusable organization models, portfolio readiness and integrations are handled through custom team access.</p></div><a className="btn-secondary" href="mailto:hello@runyourevent.com?subject=RunYourEvent%20team%20access">Discuss team access</a></div>

          <div className="mt-14 max-w-3xl"><p className="text-lg font-black tracking-[-0.025em] text-[#182237]">Necessary work is never hidden to force an upgrade.</p><p className="mt-3 text-sm leading-6 text-[#667184]">Essential is complete for a simpler event. Professional costs more because it adds deeper execution intelligence around approvals, risk, contingency, vendor scope and critical path.</p></div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-24 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[.68fr_1.32fr]">
          <div><p className="eyebrow">Volunteer Engine</p><h2 className="premium-section mt-5">Reliable hands.<br />A different pricing model.</h2><p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">Volunteer recruitment is separate from the event-plan price. Clubs pay for the season; one-off organizers pay only for successful placements. Protection is charged only when selected or required.</p></div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {[
              ['Seasonal sports club', '€200 / season', 'Recurring volunteer sourcing across the club season.'],
              ['1–5 successful placements', '€25 each', 'One-off event placement fee.'],
              ['6–15 successful placements', '€20 each', 'One-off event volume rate.'],
              ['16+ successful placements', '€15 each', 'One-off event bulk rate.'],
              ['Volunteer Protection Plus', '€1.50 / volunteer-day', 'Optional when equivalent existing volunteer cover is confirmed; required before activation when it is not. Subject to insurer terms, eligibility and availability.'],
            ].map(([name,price,copy])=><div key={name} className="grid gap-3 py-6 sm:grid-cols-[.72fr_auto] sm:items-center"><div><p className="font-black text-[#182237]">{name}</p><p className="mt-1 text-sm leading-6 text-[#667184]">{copy}</p></div><p className="text-xl font-black tracking-[-0.03em] text-[#9a741c]">{price}</p></div>)}
          </div>
        </div>
        <div className="shell mt-9"><a href="/volunteer-engine/organizers" className="btn-primary">Request volunteers <ArrowRight className="ml-2" size={15}/></a><a href="/volunteer-engine" className="text-link ml-5">See Volunteer Engine</a></div>
      </section>
    </main>
  )
}
