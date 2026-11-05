import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, Check, Clock3, GraduationCap, QrCode, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RunYourEvent | Sports Volunteers for 2–4 Hour Activities',
  description: 'RunYourEvent supplies volunteers to sports clubs for clear 2–4 hour activities. Clubs pay €10 only when a volunteer completes the activity. Students build verified hours toward a certificate.',
  alternates: { canonical: '/' },
}

const activityExamples = [
  ['Matchday setup', '2h', 'Before kickoff'],
  ['Entry & guest support', '2–3h', 'Matchday'],
  ['Food stand', '2–4h', 'Matchday'],
  ['Tournament desk', '2–4h', 'Tournament'],
  ['Scoreboard support', '2–4h', 'Matchday'],
  ['Content support', '2–4h', 'Club media'],
]

const steps = [
  ['01', 'Post the activity', 'Tell us the sport, role, venue, date and 2–4 hour window.'],
  ['02', 'We recruit', 'RunYourEvent matches the activity with suitable local volunteers.'],
  ['03', 'Volunteer completes it', 'Personal invitation plus QR check-in and check-out verify attendance.'],
  ['04', 'Pay €10', 'The fee applies only after the volunteer completes the activity.'],
]

export default function HomePage() {
  return (
    <main className="home-page overflow-hidden bg-[#f7f5ef]">
      <section className="relative isolate border-b border-black/[0.06]">

        <div className="shell relative grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-start lg:gap-8 lg:py-14">
          <div>
            <p className="eyebrow">Sports Volunteer Platform</p>
            <h2 className="page-title mt-4">Find volunteers for your next matchday.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#536072] sm:text-lg">Local help for 2–4 hour sports activities. <b className="text-[#182237]">€10 per volunteer after completion.</b></p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/volunteer-engine/organizers" className="btn-primary">Find volunteers <ArrowRight className="ml-2" size={16} /></a>
              <a href="/volunteer-engine/volunteers" className="btn-secondary">Give 2–4 hours</a>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#536072]">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />2–4 hour activities</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />€10 after completion</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />20 verified hours = certificate</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-black/[0.07] bg-[#0e1729] p-5 text-white shadow-lg sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#d9b95d]">Volunteer activity</p><p className="mt-2 text-lg font-bold">Home match · Saturday</p></div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/75">3 needed</span>
              </div>
              <div className="py-5">
                <p className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Entry support</p>
                <div className="mt-4 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
                  <p className="flex items-center gap-2"><Clock3 size={16} className="text-[#e7c66f]" />14:00–16:00</p>
                  <p className="flex items-center gap-2"><Users size={16} className="text-[#e7c66f]" />3 volunteers</p>
                  <p className="flex items-center gap-2"><QrCode size={16} className="text-[#e7c66f]" />QR attendance</p>
                  <p className="flex items-center gap-2"><BadgeCheck size={16} className="text-[#e7c66f]" />Verified hours</p>
                </div>
              </div>
              <div className="grid gap-px overflow-hidden rounded-xl bg-white/10 grid-cols-3">
                <div className="bg-[#162238] p-3"><p className="text-[10px] uppercase tracking-[.13em] text-white/65">Club pays</p><p className="mt-2 text-2xl font-black">€10</p><p className="mt-1 text-xs text-white/70">after completion</p></div>
                <div className="bg-[#162238] p-3"><p className="text-[10px] uppercase tracking-[.13em] text-white/65">Volunteer gives</p><p className="mt-2 text-2xl font-black">2h</p><p className="mt-1 text-xs text-white/70">one activity</p></div>
                <div className="bg-[#162238] p-3"><p className="text-[10px] uppercase tracking-[.13em] text-white/65">Student earns</p><p className="mt-2 text-2xl font-black">+2h</p><p className="mt-1 text-xs text-white/70">verified record</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-12 lg:py-14">
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div><p className="eyebrow">How it works</p><h3 className="premium-section mt-5">From staffing gap to completed activity.</h3></div>
            <p className="max-w-xl text-lg leading-8 text-[#646f80]">RunYourEvent handles the supply loop around the activity. The sports organization remains responsible for the event, supervision and safety.</p>
          </div>
          <div className="mt-7 grid border-y border-black/[0.08] md:grid-cols-4">
            {steps.map(([number,title,copy],index)=><article key={number} className={'py-5 md:px-5 md:py-6 '+(index>0?'border-t border-black/[0.08] md:border-l md:border-t-0':'')}><p className="text-xs font-black tracking-[.14em] text-[#9a741c]">{number}</p><h3 className="mt-3 text-lg font-bold tracking-[-0.03em] text-[#182237]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667184]">{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-10 text-white sm:py-14">
        <div className="shell grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Not another helper list</p>
            <h3 className="mt-5 text-2xl font-bold leading-tight tracking-[-0.035em] sm:text-3xl">The problem is not scheduling.<br />It is finding people.</h3>
          </div>
          <div>
            <p className="max-w-xl text-lg leading-8 text-white/75">Calendars, spreadsheets and volunteer lists can organize people you already have. RunYourEvent is built for the gap before that: supplying people for concrete sports activities.</p>
            <div className="mt-8 border-y border-white/10">
              {[
                ['No vague ask', 'A specific role, place and 2–4 hour window.'],
                ['No season commitment', 'Volunteers choose one activity at a time.'],
                ['No completed volunteer, no €10 fee', 'Clubs pay for completed help, not exposure.'],
              ].map(([title,copy])=><div key={title} className="grid gap-2 border-b border-white/10 py-5 last:border-b-0 sm:grid-cols-[.8fr_1.2fr]"><p className="font-black text-white/90">{title}</p><p className="text-sm leading-6 text-white/70">{copy}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-10 sm:py-14">
        <div className="shell grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <div><p className="eyebrow">What can volunteers do?</p><h3 className="premium-section mt-5">Small jobs that make sport possible.</h3><p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">Matchdays and tournaments are full of work that does not need a season-long volunteer. It needs a person for a few hours.</p></div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {activityExamples.map(([role,duration,context])=><div key={role} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><p className="font-black text-[#182237]">{role}</p><p className="text-xs font-bold text-[#7b8493] sm:w-28">{context}</p><p className="text-sm font-black text-[#9a741c] sm:w-16 sm:text-right">{duration}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-10 sm:py-12 lg:py-14">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-black/[0.07] bg-white p-6 sm:p-8">
            <p className="eyebrow">For sports clubs</p>
            <p className="mt-7 text-3xl font-black tracking-[-0.03em] text-[#101827]">€10</p>
            <p className="mt-2 text-sm font-bold text-[#7b8493]">per volunteer who completes the activity</p>
            <div className="mt-8 divide-y divide-black/[0.07] border-y border-black/[0.07] text-sm text-[#536072]">
              <p className="py-4"><b className="text-[#182237]">Posting:</b> free</p>
              <p className="py-4"><b className="text-[#182237]">Invitation or acceptance:</b> free</p>
              <p className="py-4"><b className="text-[#182237]">No-show:</b> no €10 fee</p>
              <p className="py-4"><b className="text-[#182237]">Completed activity:</b> €10</p>
            </div>
            <a href="/volunteer-engine/organizers" className="btn-primary mt-8">Find volunteers <ArrowRight className="ml-2" size={16}/></a>
          </article>

          <article className="rounded-2xl bg-[#0e1729] p-6 text-white sm:p-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">For students</p>
            <div className="mt-7 flex items-end gap-3"><GraduationCap size={36} className="mb-2 text-[#e7c66f]"/><p className="text-3xl font-black tracking-[-0.03em]">20h</p></div>
            <p className="mt-2 text-sm font-bold text-white/70">verified sports volunteering</p>
            <h3 className="mt-8 text-3xl font-black tracking-[-0.04em]">Build a record that says you showed up.</h3>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">Verified completed activities accumulate across clubs and sports. At 20 hours, students become eligible for the RunYourEvent Sports Volunteer Certificate.</p>
            <div className="mt-7 flex items-center gap-3 text-sm font-bold text-white/70"><ShieldCheck size={18} className="text-[#e7c66f]"/>Check-in + check-out + organizer verification</div>
            <a href="/volunteer-engine/volunteers" className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-[#101827]">Join free <ArrowRight className="ml-2" size={16}/></a>
          </article>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="eyebrow">Sports need people</p><h3 className="mt-4 max-w-3xl text-2xl font-black tracking-[-0.03em] text-[#182237]">Make the commitment small enough to say yes to.</h3></div>
          <div className="flex flex-wrap gap-3"><a href="/volunteer-engine/organizers" className="btn-primary">Find volunteers</a><a href="/volunteer-engine/volunteers" className="btn-secondary">Volunteer</a></div>
        </div>
      </section>
    </main>
  )
}
