import type { Metadata } from 'next'
import VolunteerSignupForm from '@/components/VolunteerSignupForm'

export const metadata:Metadata={
  title:'Volunteer in Sport | 2–4 Hour Activities',
  description:'Join RunYourEvent for flexible 2–4 hour sports volunteer activities. Everyone can earn Bronze, Silver and Gold recognition at 20, 40 and 60 verified hours.',
  alternates:{canonical:'/volunteer-engine/volunteers'}
}

export default function Page(){
  return <main className="bg-[#f7f5ef]">
    <section className="border-b border-black/[0.06]"><div className="shell py-20 sm:py-24"><p className="eyebrow">For volunteers</p><h1 className="premium-section mt-5 max-w-4xl">Give sport 2–4 hours at a time.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#646f80]">Choose specific local sports activities that fit your time. No season-long commitment. Everyone builds a verified record: Bronze at 20 hours, Silver at 40 and hand-signed Gold at 60.</p></div></section>
    <section className="bg-white py-20 sm:py-24"><div className="shell grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
      <aside><p className="eyebrow">One activity at a time</p><div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08] text-sm leading-6 text-[#667184]">
        <p className="py-5"><b className="text-[#182237]">1. See the exact activity.</b><br/>Role, date, venue and 2–4 hour time window are shown before you accept.</p>
        <p className="py-5"><b className="text-[#182237]">2. Accept or decline.</b><br/>One activity never commits you to another.</p>
        <p className="py-5"><b className="text-[#182237]">3. Check in and check out.</b><br/>Your personal activity link and the club QR create an attendance record.</p>
        <p className="py-5"><b className="text-[#182237]">4. Build verified hours.</b><br/>Completed time can be organizer-verified and added to your volunteer record.</p>
        <p className="py-5"><b className="text-[#182237]">5. Build your recognition.</b><br/>Earn Bronze, Silver and Gold at 20, 40 and 60 verified hours.</p>
      </div></aside>
      <div><h2 className="text-2xl font-black tracking-[-0.03em] text-[#182237]">Join the sports volunteer pool</h2><VolunteerSignupForm /></div>
    </div></section>
  </main>
}
