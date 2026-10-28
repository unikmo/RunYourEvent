import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sports Volunteering | 2–4 Hour Activities',
  description: 'RunYourEvent connects sports clubs with volunteers for clear 2–4 hour activities. Clubs pay €10 per completed volunteer. Everyone can earn Bronze, Silver and hand-signed Gold at 20, 40 and 60 verified hours.',
  alternates: { canonical: '/volunteer-engine' },
}

const roles = [
  ['Matchday setup', '2 hours'],
  ['Entry & guest support', '2–3 hours'],
  ['Food stand', '2–4 hours'],
  ['Tournament desk', '2–4 hours'],
  ['Scoreboard support', '2–4 hours'],
  ['Content support', '2–4 hours'],
]

export default function VolunteerEnginePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-8 sm:py-12 lg:py-14">
          <div className="max-w-5xl">
            <p className="eyebrow">Sports volunteering</p>
            <h1 className="premium-hero mt-6 max-w-[980px]">Give 2–4 hours.<br /><span className="text-[#9a741c]">Help sport happen.</span></h1>
            <p className="mt-8 max-w-[760px] text-[18px] leading-8 text-[#646f80] sm:text-xl">RunYourEvent is a sports-volunteer platform built around short, specific activities instead of open-ended commitments.</p>
            <div className="mt-10 flex flex-wrap gap-3"><a href="/club" className="btn-primary">I need volunteers <ArrowRight className="ml-2" size={16}/></a><a href="/volunteer-engine/volunteers" className="btn-secondary">I want to volunteer</a></div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-20 text-white sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Micro-volunteering for sport</p><h2 className="mt-5 max-w-xl text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">A role you can say yes to.</h2><p className="mt-6 max-w-lg text-base leading-7 text-white/58">Community opportunities state the job, venue and 2–4 hour window before acceptance. Employer-arranged projects can last up to eight hours.</p></div>
          <div className="divide-y divide-white/10 border-y border-white/10">{roles.map(([role,duration]) => <div key={role} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center"><p className="font-bold text-white/88">{role}</p><p className="text-sm font-black text-[#e7c66f]">{duration}</p></div>)}</div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <div><p className="eyebrow">Sports clubs</p><h2 className="premium-section mt-5">€10 per completed volunteer.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">Publish your seasonal needs and activities. Local volunteers choose a role; your club coordinates directly and verifies completed time. A sponsor can cover the €10 community placement fee.</p><a href="/club" className="btn-primary mt-8">Request volunteers <ArrowRight className="ml-2" size={16}/></a></div>
          <div><p className="eyebrow">Every volunteer</p><h2 className="premium-section mt-5">20. 40. 60 hours.<br />Recognition that grows.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">Verified time accumulates across sports activities. Everyone can earn Bronze at 20 hours, Silver at 40 and a hand-signed Gold certificate at 60.</p><a href="/volunteer-engine/volunteers" className="btn-secondary mt-8">Join the volunteer pool</a></div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-20 sm:py-24">
        <div className="shell">
          <p className="eyebrow">How it works</p>
          <div className="mt-8 grid border-y border-black/[0.08] md:grid-cols-4">
            {[
              ['1','Club posts','A 2–4 hour sports activity with role, place and time.'],
              ['2','Volunteer accepts','The volunteer chooses a specific activity—never an undefined commitment.'],
              ['3','Attendance is verified','Check-in and check-out record attendance; organizer approval verifies completed time.'],
              ['4','Hours build','Organizer-approved time builds your Bronze, Silver and Gold recognition.'],
            ].map(([n,title,body],i) => <article key={n} className={'py-8 md:px-7 ' + (i>0?'border-t border-black/[0.08] md:border-l md:border-t-0':'')}><p className="text-xs font-black text-[#9a741c]">{n}</p><h3 className="mt-5 font-black text-[#182237]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667184]">{body}</p></article>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#667184]"><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>2–4 hours per activity</span><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>€10 per completed volunteer</span><span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]"/>20 / 40 / 60-hour milestones</span></div>
        </div>
      </section>
    </main>
  )
}
