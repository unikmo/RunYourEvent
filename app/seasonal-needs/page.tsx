import type { Metadata } from 'next'
import Link from 'next/link'
import SeasonalNeedsForm from '@/components/SeasonalNeedsForm'

export const metadata: Metadata = {title:'Seasonal Volunteer Needs | RunYourEvent',description:'Plan your sports club’s seasonal volunteer needs. Request support for community activities and full-day corporate team projects.',alternates:{canonical:'/seasonal-needs'}}

export default function SeasonalNeedsPage() {
  return <main className="bg-[#f7f5ef]">
    <section className="border-b border-black/[0.06]"><div className="shell py-20 sm:py-24"><p className="eyebrow">For sports clubs</p><h1 className="premium-section mt-5 max-w-4xl">Plan the season.<br/>Share the need.</h1><p className="lede mt-6 max-w-2xl">From four hours at a tournament to a full day improving the clubhouse. Give sponsors and volunteers a clear picture of the help your club needs.</p><Link href="/opportunities" className="text-link mt-6">Explore club needs →</Link></div></section>
    <section className="bg-white py-20"><div className="shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
      <aside><p className="eyebrow">A clear path to delivery</p><div className="rule-list mt-6 text-sm leading-6 text-[#667184]">{[
        ['Describe the season','Enter each activity or repeatable role with its dates, people, hours and practical requirements.'],
        ['Make sponsorship possible','Sponsors request hour packages starting at 25 hours. A smaller club activity can form part of a package spanning several needs. Funding scope and costs are agreed before activation.'],
        ['Recruit separately','A funded need still needs suitable people. Funding, filled places and completed hours are tracked separately.'],
        ['Record the contribution','Check-in, check-out and organizer verification build an evidence-based volunteer record.'],
      ].map(([title,body])=><p key={title} className="py-5"><b className="text-[#182237]">{title}</b><br/>{body}</p>)}</div><p className="mt-6 text-sm leading-6 text-[#667184]">The host remains responsible for activity suitability, supervision, safeguarding and safety. Insurance, materials and transport are agreed separately where applicable.</p></aside>
      <div><h2 className="text-2xl font-black tracking-[-0.03em]">Tell us what your club needs</h2><SeasonalNeedsForm /></div>
    </div></section>
  </main>
}
