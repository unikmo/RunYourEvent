import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'RunYourEvent Pricing | €10 per Completed Sports Volunteer' },
  description: 'Community placements cost €10 after completion, paid by a club or sponsor. Corporate team projects are individually quoted. Volunteers join free.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <main className="bg-[#f7f5ef]">
      <section className="relative isolate overflow-hidden border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-24 text-center sm:py-32">
          <p className="eyebrow">Pricing</p>
          <h1 className="premium-hero mx-auto mt-7 max-w-5xl">One completed volunteer.<br /><span className="text-[#9a741c]">€10.</span></h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#646f80]">Community placements cost €10 after completion. A club can pay, or a sponsor can cover the fee. Corporate team projects have their own agreed package price.</p>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="eyebrow">For clubs & organizers</p>
            <p className="mt-5 text-7xl font-black tracking-[-0.07em] text-[#101827]">€10</p>
            <p className="mt-2 text-sm font-bold text-[#7b8493]">per completed volunteer activity</p>
            <a href="/volunteer-engine/organizers" className="btn-primary mt-8">Post an activity <ArrowRight className="ml-2" size={15}/></a>
          </div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {[
              ['2–4 hour community activities','A clear role, location and time window for each community placement.'],
              ['Pay after completion','Registration, invitation and a no-show do not create the €10 volunteer fee.'],
              ['Verified attendance','Check-in and check-out create the participation record.'],
              ['Recognition for everyone','Bronze at 20 verified hours, Silver at 40 and a hand-signed Gold certificate at 60.'],
            ].map(([title,copy]) => <div key={title} className="py-6"><p className="font-black text-[#182237]"><Check size={14} className="mr-2 inline text-[#9a741c]"/>{title}</p><p className="mt-2 text-sm leading-6 text-[#667184]">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-black/[0.06]"><div className="shell grid gap-10 lg:grid-cols-2"><article className="panel p-8 sm:p-10"><p className="eyebrow">Sponsor-funded community placements</p><h2 className="mt-5 text-3xl font-black tracking-tight">The fee is covered.<br/>The contribution stays local.</h2><p className="mt-5 text-base leading-8 text-[#667184]">Sponsors can cover the €10 platform fee for eligible completed placements. Clubs see the funding arrangement before confirmation. Separate protection, materials or other agreed charges are itemized; sponsorship does not automatically cover them.</p><a href="/sponsors" className="text-link mt-7">Explore sponsorship <ArrowRight size={15}/></a></article><article className="panel p-8 sm:p-10"><p className="eyebrow">Corporate projects · up to eight hours</p><h2 className="mt-5 text-3xl font-black tracking-tight">A package built<br/>around the project.</h2><p className="mt-5 text-base leading-8 text-[#667184]">Corporate team projects are individually quoted, with coordination, materials, equipment and other delivery costs clearly agreed. We do not price a full-day team project as a €10 community placement.</p><a href="/corporate" className="text-link mt-7">Plan employee volunteering <ArrowRight size={15}/></a></article></div></section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-20 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-2">
          <div><p className="eyebrow">Volunteers</p><h2 className="premium-section mt-5">Free to join.</h2><p className="mt-5 text-base leading-7 text-[#667184]">Volunteers choose the sports activities they want to accept. There is no fee and no obligation to take another activity.</p></div>
          <div><p className="eyebrow">Coverage</p><h2 className="premium-section mt-5">Organizer responsibility stays clear.</h2><p className="mt-5 text-base leading-7 text-[#667184]">Sports organizations remain responsible for supervision, safeguarding, role suitability, safety and required insurance. Where separate volunteer protection is offered, its price and insurer terms are shown before activation.</p></div>
        </div>
      </section>
    </main>
  )
}
