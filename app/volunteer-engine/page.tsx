import type { Metadata } from 'next'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Volunteer Engine | Micro-Volunteering for Events & Sports Clubs',
  description: 'Source reliable local volunteers through 2–4 hour micro-shifts, with conditional Volunteer Protection Plus for organizers without equivalent existing cover.',
  alternates: { canonical: '/volunteer-engine' },
}

const organizerModels = [
  ['Seasonal sports clubs', '€200', 'per season', 'One flat fee for recurring matchday recruitment across the season. Built for football, handball, basketball and similar clubs.'],
  ['One-off events · 1–5', '€25', 'per successful placement', 'For festivals, tournaments, cultural events, races and other single-date operations.'],
  ['One-off events · 6–15', '€20', 'per successful placement', 'Volume pricing applies to confirmed placements for the same event.'],
  ['One-off events · 16+', '€15', 'per successful placement', 'Bulk pricing for events that need a larger volunteer crew.'],
]

const volunteerRules = [
  ['2–4 hours', 'Micro-shifts', 'Short enough to fit around study, work and weekends.'],
  ['100', 'Points per hour', 'Verified participation converts directly into platform points.'],
  ['30 hours', 'Certificate threshold', '3,000 points within one season or calendar year.'],
  ['4 hours', 'Daily credit cap', 'A long single-day shift cannot shortcut sustained participation.'],
]

export default function VolunteerEnginePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-24 sm:py-32 lg:py-36">
          <div className="max-w-5xl">
            <p className="eyebrow">RunYourEvent · Volunteer Engine</p>
            <p className="mt-7 text-[11px] font-black uppercase tracking-[0.16em] text-[#8a671b]">Deine 2 Stunden für deinen Verein/Event</p>
            <h1 className="premium-hero mt-5 max-w-[980px]">Reliable event help.<br /><span className="text-[#9a741c]">Two hours at a time.</span></h1>
            <p className="mt-8 max-w-[760px] text-[18px] leading-8 text-[#646f80] sm:text-xl">Turn staffing gaps into clear 2–4 hour micro-shifts and connect with local students and young adults looking for flexible, meaningful community engagement.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="/volunteer-engine/organizers" className="btn-primary">I need volunteers <ArrowRight className="ml-2" size={16} /></a>
              <a href="/volunteer-engine/volunteers" className="btn-secondary">I want to volunteer</a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-20 text-white sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Micro-volunteering</p>
            <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">Commit to the shift. Not to your whole year.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/58">The unit of commitment is a specific job, place and short time window—not an undefined season-long obligation.</p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {[
              ['Food stand support', '2 hours'],
              ['Raffle-ticket sales', '2–3 hours'],
              ['Guest or runner support', '3–4 hours'],
              ['Matchday content support', '2–4 hours'],
            ].map(([role, duration]) => <div key={role} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center"><p className="font-bold text-white/88">{role}</p><p className="text-sm font-black text-[#e7c66f]">{duration}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div><p className="eyebrow">For organizers</p><h2 className="premium-section mt-5">Recruitment that matches how your event actually runs.</h2><p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">Recurring sports clubs need a season-long pipeline. One-off events need a rapid crew without paying before someone is actually placed.</p></div>
            <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
              {organizerModels.map(([name, price, unit, copy]) => <div key={name} className="grid gap-4 py-6 sm:grid-cols-[.72fr_auto] sm:items-start"><div><h3 className="text-lg font-black tracking-[-0.025em] text-[#172033]">{name}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#667184]">{copy}</p></div><div className="sm:text-right"><p className="text-3xl font-black tracking-[-0.04em] text-[#101827]">{price}</p><p className="mt-1 text-xs font-bold text-[#7b8493]">{unit}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-24 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <p className="eyebrow">Volunteer Protection Plus</p>
            <h2 className="premium-section mt-5">No coverage gap before the shift begins.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">Every organizer answers one simple question: does the existing event or club policy cover temporary/external volunteers for these roles?</p>
            <div className="mt-8 inline-flex items-center gap-3 border-y border-black/[0.08] py-4"><ShieldCheck size={20} className="text-[#9a741c]" /><div><p className="text-2xl font-black tracking-[-0.04em] text-[#182237]">€1.50</p><p className="text-xs font-bold text-[#7b8493]">per confirmed volunteer/day</p></div></div>
          </div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            <div className="py-6"><p className="text-sm font-black text-[#182237]">Existing equivalent cover confirmed</p><p className="mt-2 text-sm leading-6 text-[#667184]">Volunteer Protection Plus remains optional.</p></div>
            <div className="py-6"><p className="text-sm font-black text-[#182237]">No cover or organizer is unsure</p><p className="mt-2 text-sm leading-6 text-[#667184]">Volunteer Protection Plus becomes required before placements activate. This applies to sports clubs and one-off events.</p></div>
            <div className="py-6"><p className="text-sm font-black text-[#182237]">Charged only against confirmed volunteer-days</p><p className="mt-2 text-sm leading-6 text-[#667184]">Submitting a volunteer request does not create a protection charge. Cover remains subject to the connected insurer's policy terms, eligibility and availability.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow">Keep volunteers coming back</p><h2 className="premium-section mt-5">Verified contribution becomes visible progress.</h2></div><p className="max-w-xl text-lg leading-8 text-[#646f80]">QR-backed participation records feed a simple points system and a certificate designed to reward sustained regional engagement rather than one exhausting weekend.</p></div>
          <div className="mt-14 grid border-y border-black/[0.08] md:grid-cols-4">
            {volunteerRules.map(([value,title,body],index)=><article key={title} className={`py-8 md:px-7 md:py-10 ${index>0?'border-t border-black/[0.08] md:border-l md:border-t-0':''} ${index===0?'md:pl-0':''}`}><p className="text-4xl font-black tracking-[-0.05em] text-[#101827]">{value}</p><h3 className="mt-4 text-sm font-black text-[#182237]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667184]">{body}</p></article>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#667184]">{['30 hours = 3,000 points','Maximum 4 credited hours per event day','At least 8 credited event days'].map(item=><span key={item} className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />{item}</span>)}</div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="eyebrow">Clear responsibility</p><h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#182237]">RunYourEvent is the matching and execution layer.</h2></div><div><p className="text-base leading-7 text-[#667184]">The host organization remains responsible for supervision, briefing, safeguarding, role suitability, permissions, safety and local compliance. Selecting insurance does not transfer those operating duties. Any Volunteer Protection cover is governed by the insurer's policy terms.</p><div className="mt-7 flex flex-wrap gap-3"><a href="/volunteer-engine/organizers" className="btn-primary">Request volunteers <ArrowRight className="ml-2" size={16}/></a><a href="/volunteer-engine/volunteers" className="btn-secondary">Join the volunteer pool</a></div></div></div>
      </section>
    </main>
  )
}
