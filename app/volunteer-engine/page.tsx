import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Volunteer Engine | Micro-Volunteering for Events & Sports Clubs',
  description: 'Source reliable local volunteers through 2–4 hour micro-shifts. Seasonal sports-club recruitment or success-based volunteer placement for one-off events.',
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
            <p className="mt-8 max-w-[760px] text-[18px] leading-8 text-[#646f80] sm:text-xl">The Volunteer Engine turns event-day staffing gaps into clear 2–4 hour micro-shifts and connects organizers with local students and young adults looking for flexible, meaningful community engagement.</p>
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
            <p className="mt-6 max-w-lg text-base leading-7 text-white/58">Traditional volunteering often starts with an undefined commitment. Volunteer Engine starts with a specific job, place and short time window.</p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {[
              ['Burger stand support', '2 hours'],
              ['Raffle-ticket sales', '2–3 hours'],
              ['Guest or runner support', '3–4 hours'],
              ['Matchday content support', '2–4 hours'],
            ].map(([role, duration]) => (
              <div key={role} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="font-bold text-white/88">{role}</p>
                <p className="text-sm font-black text-[#e7c66f]">{duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="eyebrow">For organizers</p>
              <h2 className="premium-section mt-5">Recruitment that matches how your event actually runs.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">Recurring sports clubs need a season-long pipeline. One-off events need a rapid crew without paying before someone is actually placed.</p>
            </div>
            <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
              {organizerModels.map(([name, price, unit, copy]) => (
                <div key={name} className="grid gap-4 py-6 sm:grid-cols-[.72fr_auto] sm:items-start">
                  <div><h3 className="text-lg font-black tracking-[-0.025em] text-[#172033]">{name}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#667184]">{copy}</p></div>
                  <div className="sm:text-right"><p className="text-3xl font-black tracking-[-0.04em] text-[#101827]">{price}</p><p className="mt-1 text-xs font-bold text-[#7b8493]">{unit}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-9"><a href="/volunteer-engine/organizers" className="btn-primary">Request volunteers <ArrowRight className="ml-2" size={16} /></a></div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-24 sm:py-28">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div><p className="eyebrow">For volunteers</p><h2 className="premium-section mt-5">A few hours can become a visible record of consistency.</h2></div>
            <p className="max-w-xl text-lg leading-8 text-[#646f80]">Verified hours earn points and build toward a digital Certificate of Sustained Regional Engagement—without rewarding marathon shifts over repeated participation.</p>
          </div>
          <div className="mt-14 grid border-y border-black/[0.09] md:grid-cols-4">
            {volunteerRules.map(([value, title, body], index) => (
              <article key={title} className={`py-8 md:px-7 ${index > 0 ? 'border-t border-black/[0.08] md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}>
                <p className="text-4xl font-black tracking-[-0.05em] text-[#101827]">{value}</p>
                <h3 className="mt-5 font-black text-[#182237]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667184]">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-5"><a href="/volunteer-engine/volunteers" className="btn-primary">Join the volunteer pool <ArrowRight className="ml-2" size={16} /></a><span className="text-sm text-[#6f7886]">Pilot registration: age 16+. Under-18 participation may require parent or guardian consent.</span></div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <p className="eyebrow">The 30-hour certificate</p>
            <h2 className="premium-section mt-5">Consistency, not shortcuts.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">Certificate eligibility requires at least 30 credited hours, equivalent to 3,000 points, within the relevant season or calendar year.</p>
          </div>
          <div className="border-y border-black/[0.09]">
            {[
              ['Verified participation', 'Only organizer-verified activity counts toward progress.'],
              ['Four-hour daily cap', 'No more than four hours from a single event day can count toward certificate progress or credited points.'],
              ['Repeated engagement', 'The cap means 30 credited hours necessarily requires participation across at least eight event days.'],
              ['Digital evidence', 'Eligible volunteers can receive a verifiable Certificate of Sustained Regional Engagement.'],
            ].map(([title, copy], index) => (
              <div key={title} className={`grid gap-3 py-6 sm:grid-cols-[.6fr_1.4fr] ${index > 0 ? 'border-t border-black/[0.07]' : ''}`}>
                <p className="font-black text-[#182237]">{title}</p><p className="text-sm leading-6 text-[#667184]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div><p className="eyebrow">Clear operating boundary</p><h2 className="premium-section mt-5">Platform for matching. Responsibility stays on site.</h2></div>
          <div>
            <p className="text-base leading-7 text-[#667184]">RunYourEvent provides the digital recruitment, matching and participation-record infrastructure. The host organization remains responsible for on-site supervision, role briefing, safeguarding, role suitability, required insurance, permissions, safety and compliance with applicable local rules.</p>
            <p className="mt-5 text-sm leading-6 text-[#7b8493]">The exact allocation of legal responsibilities is governed by the applicable terms and law. Roles for under-18 volunteers must be age-appropriate and meet any applicable consent and safeguarding requirements.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06] bg-[#0e1729] py-20 text-white sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Volunteer Engine</p><h2 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">Need hands—or have two hours to give?</h2></div>
          <div className="flex flex-wrap gap-3"><a href="/volunteer-engine/organizers" className="btn-primary">Find volunteers</a><a href="/volunteer-engine/volunteers" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/8">Volunteer locally</a></div>
        </div>
      </section>
    </main>
  )
}
