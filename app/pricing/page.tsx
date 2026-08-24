import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'RunYourEvent Pricing | Plans from $19' },
  description: 'Free event execution preview. Essential $19 per event. Professional $39 per event. No subscription required for a single event.',
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
    href: '/custom',
  },
  {
    name: 'Essential',
    price: '$19',
    suffix: '/ event',
    eyebrow: 'Straightforward events',
    copy: 'A complete, right-sized execution plan for a genuinely simpler event.',
    features: ['Complete task coverage', 'Owners and backward timing', 'Dependencies', 'Completion criteria', 'Event-date anchored schedule', 'No subscription'],
    cta: 'Build my event plan',
    href: '/custom',
  },
  {
    name: 'Professional',
    price: '$39',
    suffix: '/ event',
    eyebrow: 'Complex delivery',
    copy: 'Adds deeper control when approvals, risks, suppliers and critical paths matter.',
    features: ['Everything in Essential', 'Approval gates + approvers', 'Risk consequences', 'Contingencies', 'Critical-path detail', 'Vendor/procurement scope'],
    cta: 'Build my event plan',
    href: '/custom',
    featured: true,
  },
]

export default function PricingPage() {
  return (
    <main className="bg-[#fcfbf8]">
      <section className="border-b border-black/[0.06]">
        <div className="shell py-20 sm:py-24">
          <p className="eyebrow">Pricing</p>
          <h1 className="display mt-5 max-w-4xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">Start free. Pay once for the complete event plan.</h1>
          <p className="lede mt-7">No subscription is required for a single event. Price follows execution complexity—not the event label.</p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map(plan => (
              <article key={plan.name} className={`flex flex-col rounded-[20px] border p-7 sm:p-8 ${plan.featured ? 'border-[#15233f] bg-[#15233f] text-white' : 'border-black/[0.07] bg-[#fcfbf8]'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${plan.featured ? 'text-[#e7c66f]' : 'text-[#8a671b]'}`}>{plan.eyebrow}</p>
                <h2 className="mt-3 text-xl font-black">{plan.name}</h2>
                <p className="mt-6 text-4xl font-black tracking-[-0.04em]">{plan.price} {plan.suffix && <span className="text-sm opacity-50">{plan.suffix}</span>}</p>
                <p className={`mt-5 text-sm leading-6 ${plan.featured ? 'text-white/60' : 'text-[#667184]'}`}>{plan.copy}</p>
                <ul className={`mt-7 flex-1 divide-y ${plan.featured ? 'divide-white/10 border-y border-white/10' : 'divide-black/[0.07] border-y border-black/[0.07]'}`}>
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-3 py-3.5 text-sm">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#d5ad48]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a className="btn-primary mt-7 w-full" href={plan.href}>{plan.cta}<ArrowRight className="ml-2" size={15} /></a>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-6 border-y border-black/[0.08] py-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow">Teams & agencies</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.025em] text-[#15233f]">Repeat event operations need a different model.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#667184]">Concurrent events, reusable organization models, portfolio readiness and integrations are handled through custom team access.</p>
            </div>
            <a className="btn-secondary" href="mailto:hello@runyourevent.com?subject=RunYourEvent%20team%20access">Discuss team access</a>
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="font-black text-[#15233f]">Necessary work is never hidden to force an upgrade.</p>
            <p className="mt-2 text-sm leading-6 text-[#667184]">Essential is complete for a simpler event. Professional costs more because it adds deeper execution intelligence around approvals, risk, contingency, vendor scope and critical path.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
