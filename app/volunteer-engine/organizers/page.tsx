import type { Metadata } from 'next'
import VolunteerOrganizerForm from '@/components/VolunteerOrganizerForm'

export const metadata:Metadata={
  title:'Find Sports Volunteers | RunYourEvent',
  description:'Post a 2–4 hour sports volunteer activity. Pay €10 for each volunteer who completes it.',
  alternates:{canonical:'/volunteer-engine/organizers'}
}

export default function Page(){
  return <main className="bg-[#f7f5ef]">
    <section className="border-b border-black/[0.06]"><div className="shell py-20 sm:py-24"><p className="eyebrow">For sports clubs & organizers</p><h1 className="premium-section mt-5 max-w-4xl">Turn the help you need into a 2–4 hour activity.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#646f80]">Tell us the role, place and time. RunYourEvent matches volunteers to the activity. The platform fee is <b>€10 per volunteer who completes it</b>.</p></div></section>
    <section className="bg-white py-20 sm:py-24"><div className="shell grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
      <aside><p className="eyebrow">How it works</p><div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08] text-sm leading-6 text-[#667184]">
        <p className="py-5"><b className="text-[#182237]">1. Post the activity.</b><br/>A clear sports role, venue and 2–4 hour window.</p>
        <p className="py-5"><b className="text-[#182237]">2. Volunteers accept.</b><br/>Suitable local volunteers receive the specific activity and choose whether it fits.</p>
        <p className="py-5"><b className="text-[#182237]">3. Attendance is recorded.</b><br/>The personal invitation and event QR create check-in and check-out records.</p>
        <p className="py-5"><b className="text-[#182237]">4. Pay for completion.</b><br/>A completed volunteer activity creates the €10 platform fee. An invitation or no-show does not.</p>
        <p className="py-5"><b className="text-[#182237]">5. Students build verified hours.</b><br/>Organizer-verified completed time counts toward the 20-hour certificate threshold.</p>
      </div></aside>
      <div><h2 className="text-2xl font-black tracking-[-0.03em] text-[#182237]">Post a sports volunteer activity</h2><VolunteerOrganizerForm /></div>
    </div></section>
  </main>
}
