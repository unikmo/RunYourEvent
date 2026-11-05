import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'RunYourEvent Pricing | €10 per Completed Sports Volunteer' },
  description: 'Sports clubs pay €10 for each volunteer who completes a 2–4 hour activity. Joining as a volunteer is free.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <main className="bg-[#f7f5ef]">
      <section className="relative isolate overflow-hidden border-b border-black/[0.06]">

        <div className="shell relative py-12 text-center sm:py-14">
          <p className="eyebrow">Pricing</p>
          <h2 className="page-title mx-auto mt-7 max-w-5xl">One completed volunteer.<br /><span className="text-[#9a741c]">€10.</span></h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#646f80]">No season fee. No placement tiers. No charge for invitations or no-shows. Clubs pay for completed sports-volunteer activities.</p>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-12 lg:py-14">
        <div className="shell grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="eyebrow">For clubs & organizers</p>
            <p className="mt-5 text-3xl font-black tracking-[-0.03em] text-[#101827]">€10</p>
            <p className="mt-2 text-sm font-bold text-[#7b8493]">per completed volunteer activity</p>
            <a href="/volunteer-engine/organizers" className="btn-primary mt-8">Post an activity <ArrowRight className="ml-2" size={15}/></a>
          </div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {[
              ['2–4 hour sports activities','Every volunteer opportunity is short and clearly defined.'],
              ['Pay after completion','Registration, invitation and a no-show do not create the €10 volunteer fee.'],
              ['Verified attendance','Check-in and check-out create the participation record.'],
              ['Student certificate','Students become eligible after 20 verified volunteer hours.'],
            ].map(([title,copy]) => <div key={title} className="py-6"><p className="font-black text-[#182237]"><Check size={14} className="mr-2 inline text-[#9a741c]"/>{title}</p><p className="mt-2 text-sm leading-6 text-[#667184]">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-10 sm:py-12">
        <div className="shell grid gap-6 lg:grid-cols-2">
          <div><p className="eyebrow">Volunteers</p><h3 className="premium-section mt-5">Free to join.</h3><p className="mt-5 text-base leading-7 text-[#667184]">Volunteers choose the sports activities they want to accept. There is no fee and no obligation to take another activity.</p></div>
          <div><p className="eyebrow">Coverage</p><h3 className="premium-section mt-5">Organizer responsibility stays clear.</h3><p className="mt-5 text-base leading-7 text-[#667184]">Sports organizations remain responsible for supervision, safeguarding, role suitability, safety and required insurance. Where separate volunteer protection is offered, its price and insurer terms are shown before activation.</p></div>
        </div>
      </section>
    </main>
  )
}
