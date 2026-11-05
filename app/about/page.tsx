import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata:Metadata={title:'About RunYourEvent',description:'RunYourEvent is a sports volunteer platform for clear 2–4 hour activities.',alternates:{canonical:'/about'}}

export default function AboutPage(){
  return <main className="bg-[#fbfaf7]">
    <section className="shell py-10 sm:py-12"><div className="max-w-4xl"><p className="eyebrow">About RunYourEvent</p><h2 className="page-title mt-4">Sports clubs need help.<span className="block text-[#8b7440]">People can often give two hours.</span></h2><p className="mt-7 max-w-3xl text-lg leading-8 text-[#6d7889]">RunYourEvent exists to close that gap. Clubs turn real matchday and sports work into clear 2–4 hour volunteer activities. RunYourEvent helps supply people who choose the activities that fit their lives.</p></div></section>
    <section className="border-y border-black/[.055] bg-[#f5f2ea] py-10"><div className="shell grid gap-8 md:grid-cols-3">
      <div><p className="eyebrow">Specific</p><h3 className="mt-4 text-xl font-black text-[#23324a]">A role, place and time.</h3><p className="mt-3 text-sm leading-6 text-[#687386]">No vague request to “help the club.” Every opportunity is concrete.</p></div>
      <div><p className="eyebrow">Short</p><h3 className="mt-4 text-xl font-black text-[#23324a]">2–4 hours.</h3><p className="mt-3 text-sm leading-6 text-[#687386]">The commitment is deliberately small enough to say yes to.</p></div>
      <div><p className="eyebrow">Verified</p><h3 className="mt-4 text-xl font-black text-[#23324a]">Hours that count.</h3><p className="mt-3 text-sm leading-6 text-[#687386]">Check-in, check-out and organizer verification create a credible participation record. Students can earn a certificate at 20 verified hours.</p></div>
    </div></section>
    <section className="shell py-10 sm:py-12"><div className="rounded-2xl bg-[#15233f] p-8 text-white sm:p-10"><p className="text-[11px] font-black uppercase tracking-[.15em] text-[#efcd6d]">Sports Volunteer Platform</p><div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><h3 className="max-w-2xl text-3xl font-black">Give a few hours. Help sport happen.</h3><a href="/volunteer-engine/volunteers" className="btn-signal shrink-0">Join the volunteer pool <ArrowRight className="ml-2" size={15}/></a></div></div></section>
  </main>
}
