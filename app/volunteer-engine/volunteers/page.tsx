import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import VolunteerSignupForm from '@/components/VolunteerSignupForm'

export const metadata:Metadata=pageMetadata({
  title:"Hilf im Sportverein | Freiwillige Einsätze von 2–4 Stunden",
  description:"Finde mit RunYourEvent freiwillige Einsätze im Sportverein, die zu dir passen. Sammle bestätigte Stunden für Bronze, Silber und Gold.",
  alternates:{canonical:'/volunteer-engine/volunteers'}
})

export default function Page(){
  return <main className="bg-[#f7f5ef]">
    <section className="border-b border-black/[0.06]"><div className="shell py-20 sm:py-24"><p className="eyebrow">Für Freiwillige</p><h1 className="premium-section mt-5 max-w-4xl">Ein paar Stunden für deinen Sport.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#646f80]">Wähle einen Einsatz in deiner Nähe, der in deinen Alltag passt. Du musst dich nicht für eine ganze Saison verpflichten. Deine bestätigten Stunden zählen für Bronze ab 20, Silber ab 40 und Gold ab 60 Stunden.</p></div></section>
    <section className="bg-white py-20 sm:py-24"><div className="shell grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
      <aside><p className="eyebrow">Du entscheidest bei jedem Einsatz neu</p><div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08] text-sm leading-6 text-[#667184]">
        <p className="py-5"><b className="text-[#182237]">1. Schau dir die Aufgabe an.</b><br/>Aufgabe, Datum, Ort und der Zeitraum von 2–4 Stunden stehen fest, bevor du zusagst.</p>
        <p className="py-5"><b className="text-[#182237]">2. Sag zu oder ab.</b><br/>Ein Einsatz verpflichtet dich zu keinem weiteren.</p>
        <p className="py-5"><b className="text-[#182237]">3. Melde dich vor Ort an und wieder ab.</b><br/>Über deinen persönlichen Link und den QR-Code des Vereins wird deine Anwesenheit erfasst.</p>
        <p className="py-5"><b className="text-[#182237]">4. Lass deine Stunden bestätigen.</b><br/>Der Verein prüft deine geleistete Zeit. Die bestätigten Stunden erscheinen in deinem Engagementpass.</p>
        <p className="py-5"><b className="text-[#182237]">5. Erreiche deine Meilensteine.</b><br/>Erreiche Bronze ab 20, Silber ab 40 und Gold ab 60 bestätigten Stunden.</p>
      </div></aside>
      <div><h2 className="text-2xl font-black tracking-[-0.03em] text-[#182237]">Jetzt als Freiwilliger registrieren</h2><VolunteerSignupForm /></div>
    </div></section>
  </main>
}
