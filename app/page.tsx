import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, Check, Clock3, GraduationCap, QrCode, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RunYourEvent | Sports Volunteering, Club Sponsorship & Corporate Projects',
  description: 'RunYourEvent supplies volunteers to sports clubs for clear 2–4 hour activities. Clubs pay €10 only when a volunteer completes the activity. Everyone builds verified hours toward Bronze, Silver and Gold recognition.',
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
  ['02', 'Volunteers choose', 'Your published activity appears for local volunteers to discover and join.'],
  ['03', 'Volunteer completes it', 'Personal invitation plus QR check-in and check-out verify attendance.'],
  ['04', 'Pay €10', 'The fee applies only after the volunteer completes the activity.'],
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative grid gap-14 py-20 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-32">
          <div>
            <p className="eyebrow">Sports Volunteer Platform</p>
            <h1 className="premium-hero mt-7 max-w-[840px]">Your club needs help.<br /><span className="text-[#9a741c]">Someone nearby has 2 hours.</span></h1>
            <p className="mt-8 max-w-[720px] text-[18px] leading-8 text-[#646f80] sm:text-xl">Clubs publish clear sports activities. Volunteers choose where to help and coordinate directly. Pay <b className="text-[#182237]">€10 only when a volunteer completes it.</b></p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="/club" className="btn-primary">Find volunteers <ArrowRight className="ml-2" size={16} /></a>
              <a href="/volunteer-engine/volunteers" className="btn-secondary">Give 2–4 hours</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#717a88]">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />2–4 hour activities</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />€10 after completion</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />20 / 40 / 60h recognition</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[34px] border border-black/[0.07] bg-[#0e1729] p-5 text-white shadow-[0_30px_80px_rgba(14,23,41,.16)] sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#d9b95d]">Volunteer activity</p><p className="mt-2 text-xl font-black">Home match · Saturday</p></div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/55">3 needed</span>
              </div>
              <div className="py-6">
                <p className="text-4xl font-black tracking-[-0.05em]">Entry support</p>
                <div className="mt-5 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
                  <p className="flex items-center gap-2"><Clock3 size={16} className="text-[#e7c66f]" />14:00–16:00</p>
                  <p className="flex items-center gap-2"><Users size={16} className="text-[#e7c66f]" />3 volunteers</p>
                  <p className="flex items-center gap-2"><QrCode size={16} className="text-[#e7c66f]" />QR attendance</p>
                  <p className="flex items-center gap-2"><BadgeCheck size={16} className="text-[#e7c66f]" />Verified hours</p>
                </div>
              </div>
              <div className="grid gap-px overflow-hidden rounded-[20px] bg-white/10 sm:grid-cols-3">
                <div className="bg-[#162238] p-4"><p className="text-[10px] uppercase tracking-[.13em] text-white/35">Club pays</p><p className="mt-2 text-2xl font-black">€10</p><p className="mt-1 text-xs text-white/45">after completion</p></div>
                <div className="bg-[#162238] p-4"><p className="text-[10px] uppercase tracking-[.13em] text-white/35">Volunteer gives</p><p className="mt-2 text-2xl font-black">2h</p><p className="mt-1 text-xs text-white/45">one activity</p></div>
                <div className="bg-[#162238] p-4"><p className="text-[10px] uppercase tracking-[.13em] text-white/35">Volunteer earns</p><p className="mt-2 text-2xl font-black">+2h</p><p className="mt-1 text-xs text-white/45">verified record</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-20 text-white sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Not another helper list</p>
            <h2 className="mt-5 text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">The problem is not scheduling.<br />It is finding people.</h2>
          </div>
          <div>
            <p className="max-w-xl text-lg leading-8 text-white/60">Calendars, spreadsheets and volunteer lists can organize people you already have. RunYourEvent is built for the gap before that: helping local volunteers discover and join concrete sports activities.</p>
            <div className="mt-8 border-y border-white/10">
              {[
                ['No vague ask', 'A specific role, place and 2–4 hour window.'],
                ['No season commitment', 'Volunteers choose one activity at a time.'],
                ['No completed volunteer, no €10 fee', 'Clubs pay for completed help, not exposure.'],
              ].map(([title,copy])=><div key={title} className="grid gap-2 border-b border-white/10 py-5 last:border-b-0 sm:grid-cols-[.8fr_1.2fr]"><p className="font-black text-white/90">{title}</p><p className="text-sm leading-6 text-white/52">{copy}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div><p className="eyebrow">How it works</p><h2 className="premium-section mt-5">From staffing gap to completed activity.</h2></div>
            <p className="max-w-xl text-lg leading-8 text-[#646f80]">Clubs publish, volunteers choose and both sides coordinate in one workspace. The sports organization remains responsible for the event, supervision and safety.</p>
          </div>
          <div className="mt-14 grid border-y border-black/[0.08] md:grid-cols-4">
            {steps.map(([number,title,copy],index)=><article key={number} className={'py-8 md:px-7 md:py-10 '+(index>0?'border-t border-black/[0.08] md:border-l md:border-t-0':'')}><p className="text-xs font-black tracking-[.14em] text-[#9a741c]">{number}</p><h3 className="mt-7 text-xl font-black tracking-[-0.03em] text-[#182237]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667184]">{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-24 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[.7fr_1.3fr]">
          <div><p className="eyebrow">What can volunteers do?</p><h2 className="premium-section mt-5">Small jobs that make sport possible.</h2><p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">Matchdays and tournaments are full of work that does not need a season-long volunteer. It needs a person for a few hours.</p></div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {activityExamples.map(([role,duration,context])=><div key={role} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><p className="font-black text-[#182237]">{role}</p><p className="text-xs font-bold text-[#7b8493] sm:w-28">{context}</p><p className="text-sm font-black text-[#9a741c] sm:w-16 sm:text-right">{duration}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <article className="rounded-[30px] border border-black/[0.07] bg-white p-8 sm:p-10">
            <p className="eyebrow">For sports clubs</p>
            <p className="mt-7 text-7xl font-black tracking-[-0.07em] text-[#101827]">€10</p>
            <p className="mt-2 text-sm font-bold text-[#7b8493]">per volunteer who completes the activity</p>
            <div className="mt-8 divide-y divide-black/[0.07] border-y border-black/[0.07] text-sm text-[#536072]">
              <p className="py-4"><b className="text-[#182237]">Posting:</b> free</p>
              <p className="py-4"><b className="text-[#182237]">Invitation or acceptance:</b> free</p>
              <p className="py-4"><b className="text-[#182237]">No-show:</b> no €10 fee</p>
              <p className="py-4"><b className="text-[#182237]">Completed activity:</b> €10</p>
            </div>
            <a href="/club" className="btn-primary mt-8">Find volunteers <ArrowRight className="ml-2" size={16}/></a>
          </article>

          <article className="rounded-[30px] bg-[#0e1729] p-8 text-white sm:p-10">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">For every volunteer</p>
            <div className="mt-7 flex items-end gap-3"><GraduationCap size={36} className="mb-2 text-[#e7c66f]"/><p className="text-7xl font-black tracking-[-0.07em]">20h</p></div>
            <p className="mt-2 text-sm font-bold text-white/45">verified sports volunteering</p>
            <h2 className="mt-8 text-3xl font-black tracking-[-0.04em]">Build a record that says you showed up.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/58">Verified completed activities accumulate across clubs and sports. Reach Bronze at 20 hours, Silver at 40 and Gold at 60. Gold certificates are hand-signed. Your verified record grows with every completed activity.</p>
            <div className="mt-7 flex items-center gap-3 text-sm font-bold text-white/70"><ShieldCheck size={18} className="text-[#e7c66f]"/>Check-in + check-out + organizer verification</div>
            <a href="/recognition" className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-[#101827]">Explore recognition <ArrowRight className="ml-2" size={16}/></a>
          </article>
        </div>
      </section>

      <section className="border-y border-black/[0.07] bg-white py-24 sm:py-28">
        <div className="shell">
          <p className="eyebrow">A whole season of possibility</p>
          <h2 className="premium-section mt-5 max-w-4xl">Clubs bring the needs.<br />Companies help make it happen.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              ['For clubs', 'Plan beyond the next match.', 'Enter your seasonal needs, from matchday helpers to a clubhouse refresh. Sponsors can support all or part of the work.', '/seasonal-needs', 'Add seasonal needs'],
              ['For sponsors', 'Back your local sports community.', 'Cover volunteer placement fees for a club, a project or part of a season. See funding and verified delivery separately.', '/sponsors', 'Explore sponsorship'],
              ['For employers', 'Give your team a useful day.', 'Plan a corporate sports-club project of up to eight hours, with clear tasks, supervision and verified participation.', '/corporate', 'Plan a team project'],
            ].map(([label,title,copy,href,cta]) => <article key={label} className="border-t border-black/10 pt-7"><p className="eyebrow">{label}</p><h3 className="mt-4 text-2xl font-black tracking-tight">{title}</h3><p className="mt-4 text-sm leading-7 text-[#667184]">{copy}</p><a className="text-link mt-6" href={href}>{cta}<ArrowRight size={14}/></a></article>)}
          </div>
        </div>
      </section>
      <section className="bg-[#eeeae0] py-20 sm:py-24">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow">Make a plan for the weekend</p><h2 className="premium-section mt-5 max-w-3xl">Bring your friends.<br />Give four hours.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-[#667184]">Choose an activity, share it with your friends and make a useful day of it. Each person confirms their own place and builds their own verified contribution record.</p></div><a href="/activities" className="btn-primary">Find an activity <ArrowRight className="ml-2" size={16}/></a></div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="eyebrow">Sports need people</p><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] text-[#182237]">Make the commitment small enough to say yes to.</h2></div>
          <div className="flex flex-wrap gap-3"><a href="/club" className="btn-primary">Find volunteers</a><a href="/volunteer-engine/volunteers" className="btn-secondary">Volunteer</a></div>
        </div>
      </section>
    </main>
  )
}
