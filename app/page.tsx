import type { Metadata } from 'next'
import { ArrowRight, Check, Clock3, GraduationCap, QrCode, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RunYourEvent | Sports Volunteer Platform',
  description: 'Sports clubs post clear 2–4 hour volunteer activities. RunYourEvent helps supply volunteers. Clubs pay €8 per completed volunteer. Students build verified hours toward a certificate.',
  alternates: { canonical: '/' },
}

const activities = [
  ['Matchday setup', '2 hours'],
  ['Entry & guest support', '2–3 hours'],
  ['Food stand support', '2–4 hours'],
  ['Tournament support', '3–4 hours'],
  ['Scoreboard & table support', '2–4 hours'],
  ['Content & photo support', '2–4 hours'],
]

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef]">
      <section className="relative isolate border-b border-black/[0.06]">
        <div className="premium-halo" aria-hidden="true" />
        <div className="shell relative py-24 text-center sm:py-32 lg:py-36">
          <p className="eyebrow">Sports Volunteer Platform</p>
          <h1 className="premium-hero mx-auto mt-7 max-w-[1050px]">Need more hands?<br /><span className="text-[#9a741c]">Ask for 2–4 hours.</span></h1>
          <p className="mx-auto mt-8 max-w-[780px] text-[18px] leading-8 text-[#646f80] sm:text-xl">RunYourEvent helps sports clubs fill short, specific volunteer activities. Clear role. Clear time. Clear place. No open-ended commitment.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="/volunteer-engine/organizers" className="btn-primary">I need volunteers <ArrowRight className="ml-2" size={16} /></a>
            <a href="/volunteer-engine/volunteers" className="btn-secondary">I want to volunteer</a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm font-semibold text-[#717a88]">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />2–4 hour sports activities</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />€8 per completed volunteer</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9a741c]" />20 verified hours = student certificate</span>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1729] py-20 text-white sm:py-28 lg:py-32">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d9b95d]">Volunteer supply, not scheduling software</p>
              <h2 className="mt-5 text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">Do not ask for a season.<br />Ask for two hours.</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-white/60">Clubs already have calendars, spreadsheets and helper lists. RunYourEvent solves the harder problem: finding people willing to take a concrete sports activity.</p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden border-y border-white/10 bg-white/10 md:grid-cols-3">
            <div className="bg-[#0e1729] p-7"><Clock3 className="text-[#e7c66f]" size={22}/><h3 className="mt-5 text-xl font-black">2–4 hours</h3><p className="mt-3 text-sm leading-6 text-white/55">Every activity has a defined start, finish, place and role.</p></div>
            <div className="bg-[#0e1729] p-7"><QrCode className="text-[#e7c66f]" size={22}/><h3 className="mt-5 text-xl font-black">Verified attendance</h3><p className="mt-3 text-sm leading-6 text-white/55">Accept, reconfirm, check in and check out. No vague participation records.</p></div>
            <div className="bg-[#0e1729] p-7"><GraduationCap className="text-[#e7c66f]" size={22}/><h3 className="mt-5 text-xl font-black">Hours that count</h3><p className="mt-3 text-sm leading-6 text-white/55">Students build verified sports-volunteering hours and earn a certificate at 20 hours.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="shell grid gap-14 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="eyebrow">For sports clubs</p>
            <h2 className="premium-section mt-5">Post the work.<br />We help supply the people.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#667184]">A match, tournament or club day becomes concrete volunteer activities people can realistically accept.</p>
          </div>
          <div className="divide-y divide-black/[0.09] border-y border-black/[0.09]">
            {activities.map(([role, duration]) => <div key={role} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center"><p className="font-black text-[#182237]">{role}</p><p className="text-sm font-black text-[#9a741c]">{duration}</p></div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-[#eeeae0] py-24 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">For organizers</p>
            <h2 className="premium-section mt-5">€8 when a volunteer completes the activity.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">No annual club package. No volume tiers. No charge merely because someone registered or was invited.</p>
            <a href="/volunteer-engine/organizers" className="btn-primary mt-8">Post a sports activity <ArrowRight className="ml-2" size={16}/></a>
          </div>
          <div>
            <p className="eyebrow">For students</p>
            <h2 className="premium-section mt-5">Give time. Build a verified record.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#667184]">Completed and verified sports-volunteering time accumulates across activities. At 20 verified hours, students become eligible for a RunYourEvent Sports Volunteer Certificate.</p>
            <a href="/volunteer-engine/volunteers" className="btn-secondary mt-8">Join the volunteer pool</a>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] py-20 sm:py-24">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="eyebrow">One platform. One job.</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#182237]">Help sports clubs fill short volunteer activities.</h2></div>
          <div className="flex flex-wrap gap-3"><a href="/volunteer-engine/organizers" className="btn-primary"><Users className="mr-2" size={16}/>Find volunteers</a><a href="/volunteer-engine/volunteers" className="btn-secondary">Volunteer</a></div>
        </div>
      </section>
    </main>
  )
}
