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
    <main className="bg-[#fcfbf8]">
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}

      <section className="border-b border-black/[0.06]">
        <div className="shell grid gap-12 py-20 lg:grid-cols-[1.06fr_.64fr] lg:items-end lg:py-24">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display mt-5 max-w-5xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="lede mt-7">{lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a className="btn-primary" href="/custom">{cta} <ArrowRight className="ml-2" size={15} /></a>
              <a className="text-link" href="#framework">See the execution framework</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#707b8c]">
              {['Free preview', 'Backward scheduled from the event date', 'Live workspace after purchase'].map(item => (
                <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-[#9a741c]" />{item}</span>
              ))}
            </div>
          </div>

          <aside className="border-y border-black/[0.08] py-2 lg:border-l lg:border-y-0 lg:py-0 lg:pl-8" aria-label="Execution scope">
            <p className="eyebrow py-4">Execution scope</p>
            <div className="divide-y divide-black/[0.07] border-t border-black/[0.07]">
              {workstreams.map(item => <p key={item} className="py-4 text-sm font-bold text-[#24324a]">{item}</p>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="eyebrow">From planning to execution</p>
            <h2 className="section-title mt-4">A checklist remembers work. A connected plan controls it.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">{intro}</p>
          </div>
          <ol className="grid border-y border-black/[0.07] sm:grid-cols-2">
            {outputs.map((item, index) => (
              <li key={item} className={`py-6 sm:px-6 ${index % 2 === 1 ? 'sm:border-l sm:border-black/[0.07]' : ''} ${index > 1 ? 'border-t border-black/[0.07]' : index === 1 ? 'border-t border-black/[0.07] sm:border-t-0' : ''}`}>
                <span className="text-[10px] font-black tracking-[0.12em] text-[#9a741c]">{String(index + 1).padStart(2, '0')}</span>
                <p className="mt-3 max-w-sm font-black leading-6 text-[#24324a]">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="framework" className="section-pad border-y border-black/[0.06] bg-[#f4f1e9]">
        <div className="shell">
          <p className="eyebrow">Execution framework</p>
          <h2 className="section-title mt-4">Work backwards from the fixed date. Make every dependency visible.</h2>
          <div className="mt-12 grid border-y border-black/[0.08] md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className={`py-7 md:px-7 ${index > 0 ? 'border-t border-black/[0.08] md:border-t-0' : ''} ${index % 2 === 1 ? 'md:border-l md:border-black/[0.08]' : ''} ${index >= 2 ? 'md:border-t md:border-black/[0.08] xl:border-t-0' : ''} ${index > 0 ? 'xl:border-l xl:border-black/[0.08]' : ''}`}>
                <p className="text-xs font-black tracking-[0.12em] text-[#9a741c]">0{index + 1}</p>
                <h3 className="mt-5 text-lg font-black tracking-[-0.02em] text-[#24324a]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667184]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#15233f] text-white">
        <div className="shell grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e7c66f]">Execution exposure</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-[1.03] tracking-[-0.04em] sm:text-5xl">The event date does not move because the work is late.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/60">RunYourEvent surfaces ownership gaps, blocked work and schedule exposure while there is still time to act.</p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/12">
            {pitfalls.map(item => <p key={item} className="py-5 text-sm font-bold leading-6 text-white/80">{item}</p>)}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-pad bg-[#f4f1e9]">
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

      <section className="section-pad bg-white">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">RunYourEvent</p>
            <h2 className="section-title mt-4">Turn the fixed date into a plan your team can actually execute.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#667184]">Generate the plan, assign the work, track readiness, replan when dates move and run event day from the same execution workspace.</p>
          </div>
          <a className="btn-primary shrink-0" href="/custom">{cta} <ArrowRight className="ml-2" size={15} /></a>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section-pad border-t border-black/[0.06] bg-[#fcfbf8]">
          <div className="shell grid gap-10 lg:grid-cols-[.55fr_1.45fr]">
            <div><p className="eyebrow">Questions</p><h2 className="display mt-4 text-3xl font-black">What people ask before they start.</h2></div>
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
