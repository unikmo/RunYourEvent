import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata:Metadata={title:'About RunYourEvent',description:'RunYourEvent connects sports clubs, community volunteers, employee teams and sponsors through clear activities and verified contribution.',alternates:{canonical:'/about'}}

export default function AboutPage(){
  return <main className="bg-[#fbfaf7]">
    <section className="shell py-20 sm:py-24"><div className="max-w-4xl"><p className="eyebrow">About RunYourEvent</p><h1 className="display mt-4 text-5xl font-black leading-[1.01] sm:text-6xl">Sports clubs need help.<span className="block text-[#8b7440]">People can often give two hours.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-[#6d7889]">RunYourEvent exists to close that gap. Clubs turn real matchday and sports work into clear 2–4 hour volunteer activities. People choose activities that fit their lives, clubs coordinate directly, and companies can fund community participation or employee projects of up to eight hours.</p></div></section>
    <section className="border-y border-black/[.055] bg-[#f5f2ea] py-20"><div className="shell grid gap-8 md:grid-cols-3">
      <div><p className="eyebrow">Specific</p><h2 className="mt-4 text-xl font-black text-[#23324a]">A role, place and time.</h2><p className="mt-3 text-sm leading-6 text-[#687386]">No vague request to “help the club.” Every opportunity is concrete.</p></div>
      <div><p className="eyebrow">Short</p><h2 className="mt-4 text-xl font-black text-[#23324a]">2–4 hours.</h2><p className="mt-3 text-sm leading-6 text-[#687386]">Community activities last 2–4 hours. Employee team projects can run up to eight hours, with the scope and breaks agreed in advance.</p></div>
      <div><p className="eyebrow">Verified</p><h2 className="mt-4 text-xl font-black text-[#23324a]">Hours that count.</h2><p className="mt-3 text-sm leading-6 text-[#687386]">Check-in, check-out and organizer verification create a credible participation record. Every eligible volunteer can earn Bronze at 20 hours, Silver at 40 and hand-signed Gold at 60.</p></div>
    </div></section>
    <section className="shell py-20 sm:py-24"><div className="rounded-[32px] bg-[#15233f] p-8 text-white sm:p-10"><p className="text-[11px] font-black uppercase tracking-[.15em] text-[#efcd6d]">Sports Volunteer Platform</p><div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><h2 className="max-w-2xl text-3xl font-black">Give a few hours. Help sport happen.</h2><a href="/volunteer-engine/volunteers" className="btn-signal shrink-0">Join the volunteer pool <ArrowRight className="ml-2" size={15}/></a></div></div></section>
  </main>
}
