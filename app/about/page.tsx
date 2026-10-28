import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata:Metadata=pageMetadata({title:"Über RunYourEvent",description:"RunYourEvent bringt Sportvereine, Freiwillige, Unternehmen und Sponsoren zusammen – mit klaren Aufgaben und bestätigten Stunden.",alternates:{canonical:'/about'}})

export default function AboutPage(){
  return <main className="bg-[#fbfaf7]">
    <section className="shell py-20 sm:py-24"><div className="max-w-4xl"><p className="eyebrow">Über RunYourEvent</p><h1 className="display mt-4 text-5xl font-black leading-[1.01] sm:text-6xl">Vereine brauchen Unterstützung.<span className="block text-[#8b7440]">Du hast vielleicht zwei Stunden Zeit.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-[#6d7889]">Wir bringen beides zusammen. Vereine schreiben konkrete Aufgaben für 2–4 Stunden aus. Du wählst einen Einsatz, der zu dir passt, und sprichst dich direkt mit dem Verein ab. Unternehmen können Einsätze finanzieren oder mit ihrem Team bis zu acht Stunden selbst mithelfen.</p></div></section>
    <section className="border-y border-black/[.055] bg-[#f5f2ea] py-20"><div className="shell grid gap-8 md:grid-cols-3">
      <div><p className="eyebrow">Konkret</p><h2 className="mt-4 text-xl font-black text-[#23324a]">Du weißt, was dich erwartet.</h2><p className="mt-3 text-sm leading-6 text-[#687386]">Jeder Einsatz nennt eine Aufgabe, einen Ort und eine Zeit. So kannst du entscheiden, ob er zu dir passt.</p></div>
      <div><p className="eyebrow">Überschaubar</p><h2 className="mt-4 text-xl font-black text-[#23324a]">2–4 Stunden.</h2><p className="mt-3 text-sm leading-6 text-[#687386]">Einzelne freiwillige Einsätze dauern 2–4 Stunden. Teameinsätze können bis zu acht Stunden dauern. Umfang und Pausen werden vorher vereinbart.</p></div>
      <div><p className="eyebrow">Nachvollziehbar</p><h2 className="mt-4 text-xl font-black text-[#23324a]">Deine Stunden zählen.</h2><p className="mt-3 text-sm leading-6 text-[#687386]">Du meldest dich vor Ort an und wieder ab. Der Verein bestätigt deine Stunden. Ab 20 bestätigten Stunden erreichst du Bronze, ab 40 Silber und ab 60 Gold mit einer von Hand unterschriebenen Urkunde.</p></div>
    </div></section>
    <section className="shell py-20 sm:py-24"><div className="rounded-[32px] bg-[#15233f] p-8 text-white sm:p-10"><p className="text-[11px] font-black uppercase tracking-[.15em] text-[#efcd6d]">Freiwilliges Engagement im Sport</p><div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><h2 className="max-w-2xl text-3xl font-black">Schenk ein paar Stunden. Mach Sport vor Ort möglich.</h2><a href="/volunteer-engine/volunteers" className="btn-signal shrink-0">Als Freiwilliger registrieren <ArrowRight className="ml-2" size={15}/></a></div></div></section>
  </main>
}
