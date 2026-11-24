import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = pageMetadata({
  title: 'Contact RunYourEvent',
  description: 'Questions about volunteering, your club, sponsorship or a team volunteering day? Write to us.',
  alternates: { canonical: '/contact' },
})

export default function Page() {
  return (
    <main className="bg-[#fbfaf7]">
      <section className="shell max-w-4xl py-10">
        <p className="eyebrow">Contact</p>
        <h2 className="page-title mt-4">Let us talk.</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#687386]">
          We help volunteers, club organisers, sponsors and companies planning a team volunteering day.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ContactForm />
          <div className="grid content-start gap-5">
            <div className="panel p-7">
              <h3 className="font-black text-[#23324a]">Email</h3>
              <a className="mt-3 block text-lg font-black text-[#9a7b31]" href="mailto:hello@runyourevent.com">hello@runyourevent.com</a>
              <p className="mt-4 text-sm text-[#687386]">For questions about clubs, volunteering, sponsorship, team days or your account.</p>
            </div>
            <div className="panel p-7">
              <h3 className="font-black text-[#23324a]">Provider</h3>
              <p className="mt-3 text-sm leading-6 text-[#687386]">PlanetHike OÜ<br />Järvevana tee 9<br />11314 Tallinn, Estonia<br />+49 (0)163 466 8380</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
