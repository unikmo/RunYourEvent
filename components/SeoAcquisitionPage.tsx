import { ArrowRight, CheckCircle2 } from 'lucide-react'

export type SeoAcquisitionPageProps = {
  slug?: string
  eyebrow: string
  title: string
  lead: string
  intro: string
  workstreams: string[]
  steps: { title: string; body: string }[]
  outputs: string[]
  pitfalls: string[]
  cta?: string
  faqs?: { q: string; a: string }[]
  related?: { title: string; href: string }[]
}

export default function SeoAcquisitionPage({ slug, eyebrow, title, lead, intro, workstreams, steps, outputs, pitfalls, cta = 'Build my execution plan', faqs = [], related = [] }: SeoAcquisitionPageProps) {
  const faqSchema = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  } : null
  const breadcrumbSchema = slug ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'RunYourEvent', item: 'https://runyourevent.com/' },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://runyourevent.com/resources' },
      { '@type': 'ListItem', position: 3, name: eyebrow, item: `https://runyourevent.com/${slug}` },
    ],
  } : null

  return (
    <main className="bg-[#f7f5ef]">
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}

      <section className="relative isolate overflow-hidden border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-24 sm:py-28 lg:py-32">
          <div className="max-w-5xl">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-6 text-[clamp(3rem,7vw,6.5rem)] font-black leading-[0.91] tracking-[-0.06em] text-[#101827]">{title}</h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#646f80]">{lead}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a className="btn-primary" href="/custom">{cta} <ArrowRight className="ml-2" size={15} /></a>
              <a className="text-link" href="#framework">See the execution framework</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#707b8c]">
              {['Free preview', 'Backward scheduled from event day', 'Live workspace after purchase'].map(item => (
                <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-[#9a741c]" />{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[.68fr_1.32fr]">
          <div>
            <p className="eyebrow">Execution scope</p>
            <h2 className="premium-section mt-5">What has to become true.</h2>
          </div>
          <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {workstreams.map(item => <p key={item} className="py-5 text-base font-black tracking-[-0.02em] text-[#24324a]">{item}</p>)}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-20 sm:py-24 lg:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="eyebrow">From planning to execution</p>
            <h2 className="premium-section mt-5">A checklist remembers work. A connected plan controls it.</h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#667184]">{intro}</p>
          </div>
          <ol className="grid border-y border-black/[0.08] sm:grid-cols-2">
            {outputs.map((item, index) => (
              <li key={item} className={`py-6 sm:px-7 ${index % 2 === 1 ? 'sm:border-l sm:border-black/[0.08]' : ''} ${index > 1 ? 'border-t border-black/[0.08]' : index === 1 ? 'border-t border-black/[0.08] sm:border-t-0' : ''}`}>
                <span className="text-[10px] font-black tracking-[0.14em] text-[#9a741c]">{String(index + 1).padStart(2, '0')}</span>
                <p className="mt-4 max-w-sm font-black leading-6 text-[#24324a]">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="framework" className="bg-[#f7f5ef] py-20 sm:py-24 lg:py-28">
        <div className="shell">
          <p className="eyebrow">Execution framework</p>
          <h2 className="premium-section mt-5 max-w-5xl">Work backwards from the fixed date. Make every dependency visible.</h2>
          <div className="mt-12 grid border-y border-black/[0.08] md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className={`py-8 md:px-8 ${index > 0 ? 'border-t border-black/[0.08] md:border-t-0' : ''} ${index % 2 === 1 ? 'md:border-l md:border-black/[0.08]' : ''} ${index >= 2 ? 'md:border-t md:border-black/[0.08] xl:border-t-0' : ''} ${index > 0 ? 'xl:border-l xl:border-black/[0.08]' : ''}`}>
                <p className="text-xs font-black tracking-[0.14em] text-[#9a741c]">0{index + 1}</p>
                <h3 className="mt-7 text-xl font-black tracking-[-0.025em] text-[#24324a]">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#667184]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-24 text-white sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#e7c66f]">Execution exposure</p>
            <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1.01] tracking-[-0.05em] sm:text-5xl">The event date does not move because the work is late.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/55">RunYourEvent surfaces ownership gaps, blocked work and schedule exposure while there is still time to act.</p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/12">
            {pitfalls.map(item => <p key={item} className="py-5 text-sm font-bold leading-6 text-white/78">{item}</p>)}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#eeeae0] py-20 sm:py-24">
          <div className="shell">
            <p className="eyebrow">Related execution guides</p>
            <div className="mt-7 grid border-y border-black/[0.08] md:grid-cols-2">
              {related.map((item, index) => (
                <a key={item.href} href={item.href} className={`group flex items-center justify-between gap-5 py-5 text-sm font-black leading-6 text-[#24324a] ${index % 2 === 1 ? 'md:border-l md:border-black/[0.08] md:pl-6' : 'md:pr-6'} ${index > 1 ? 'border-t border-black/[0.08]' : index === 1 ? 'border-t border-black/[0.08] md:border-t-0' : ''}`}>
                  <span>{item.title}</span><ArrowRight size={15} className="shrink-0 text-[#9a741c] transition-transform duration-150 group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">RunYourEvent</p>
            <h2 className="premium-section mt-5">Turn the fixed date into a plan your team can actually execute.</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#667184]">Generate the plan, assign the work, track readiness, replan when dates move and run event day from the same execution workspace.</p>
          </div>
          <a className="btn-primary shrink-0" href="/custom">{cta} <ArrowRight className="ml-2" size={15} /></a>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="border-t border-black/[0.06] bg-[#f7f5ef] py-20 sm:py-24">
          <div className="shell grid gap-10 lg:grid-cols-[.55fr_1.45fr]">
            <div><p className="eyebrow">Questions</p><h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#101827]">What people ask before they start.</h2></div>
            <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 font-black text-[#24324a] marker:hidden">{q}</summary>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667184]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
