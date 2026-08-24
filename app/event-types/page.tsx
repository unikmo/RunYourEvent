import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Event Types | RunYourEvent',
  description: 'Explore RunYourEvent execution guides for company events, weddings, reunions, nonprofit and volunteer events, community events, celebrations and professional operators.',
  alternates: { canonical: '/event-types' },
}

const primary = [
  ['Company & corporate events', 'Build the complete execution plan across venue, program, production, guests, vendors, approvals and event day.', '/company-event-planning'],
  ['Wedding planning', 'Turn the fixed wedding date into an accountable checklist, timeline and wedding-day Run of Show.', '/wedding-planning-checklist'],
  ['Family reunions', 'Coordinate travel, stays, meals, activities and family responsibilities from one operating plan.', '/family-reunion-planning'],
  ['Class reunions', 'Give outreach, venue, attendance, vendors, program and volunteer work clear owners and dates.', '/class-reunion-planning'],
]

const mission = [
  ['Nonprofit events', 'Mission, sponsors, donors, volunteers, finance and delivery.', '/nonprofit-event-planning'],
  ['Volunteer-led events', 'Committee execution, ownership, handoffs and contingencies.', '/volunteer-event-planning'],
  ['Charity events', 'Supporters, sponsors, volunteers and fundraising moments.', '/charity-event-planning'],
  ['Fundraising events', 'Giving mechanics, donor experience and financial readiness.', '/fundraising-event-planning-checklist'],
  ['Church events', 'Ministry teams, facilities, hospitality, volunteers and safety.', '/church-event-planning'],
  ['Community events', 'Permits, partners, site logistics, volunteers and public operations.', '/community-event-planning'],
  ['Sports events', 'Venue, officials, equipment, participants, safety and live control.', '/sports-event-planning'],
]

const adjacent = [
  ['Destination weddings', 'Wedding execution plus guest travel, rooms, transfers and local vendors.', '/destination-wedding-planning'],
  ['Company offsites', 'Team outcomes, venue, travel, workshops, meals and on-site delivery.', '/offsite-event-planning'],
  ['Product launches', 'Message, demo, press, production, approvals and technical rehearsal.', '/product-launch-event-planning'],
  ['Small business events', 'Right-sized event execution for lean teams.', '/small-business-event-planning'],
  ['Birthday parties', 'Milestone-event checklist, suppliers and party-day sequence.', '/birthday-party-planning-checklist'],
  ['Graduation parties', 'Ceremony constraints, guests, hospitality and celebration-day execution.', '/graduation-party-planning-checklist'],
]

type Item = string[]

function Directory({ items }: { items: Item[] }) {
  return (
    <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
      {items.map(([title, body, href]) => (
        <a key={title} href={href} className="group grid gap-3 py-5 sm:grid-cols-[.72fr_1.28fr_auto] sm:items-center">
          <h3 className="font-black tracking-[-0.02em] text-[#15233f]">{title}</h3>
          <p className="text-sm leading-6 text-[#667184]">{body}</p>
          <ArrowRight size={15} className="text-[#9a741c] transition-transform duration-150 group-hover:translate-x-1" />
        </a>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <main className="bg-[#fcfbf8]">
      <section className="border-b border-black/[0.06]">
        <div className="shell py-20 sm:py-24">
          <p className="eyebrow">Event types</p>
          <h1 className="display mt-5 max-w-5xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">One execution engine. Built around the event you actually have to deliver.</h1>
          <p className="lede mt-7">Start with the event type that matches your situation. Each guide uses the language people search for, while the product itself remains focused on execution.</p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell grid gap-12 lg:grid-cols-[.58fr_1.42fr]">
          <div><p className="eyebrow">Most-used starting points</p><h2 className="section-title mt-4">High-intent event journeys.</h2></div>
          <Directory items={primary} />
        </div>
      </section>

      <section className="section-pad border-y border-black/[0.06] bg-[#f4f1e9]">
        <div className="shell grid gap-12 lg:grid-cols-[.58fr_1.42fr]">
          <div><p className="eyebrow">Nonprofit, volunteer & community</p><h2 className="display mt-4 text-3xl font-black tracking-[-0.04em] text-[#15233f]">Complex coordination without enterprise overhead.</h2></div>
          <Directory items={mission} />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell grid gap-12 lg:grid-cols-[.58fr_1.42fr]">
          <div><p className="eyebrow">Adjacent high-intent guides</p><h2 className="display mt-4 text-3xl font-black tracking-[-0.04em] text-[#15233f]">Specific events. Specific execution logic.</h2></div>
          <Directory items={adjacent} />
        </div>
      </section>

      <section className="section-pad bg-[#15233f] text-white">
        <div className="shell grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e7c66f]">Professional operators</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-0.04em] sm:text-5xl">Run repeat events without turning every event into the same template.</h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {[
              ['Event teams & agencies', 'Standardize execution while preserving event-specific logic.', '/agencies'],
              ['Hotels & venues', 'Coordinate clients, suppliers and internal teams from one operating plan.', '/venues'],
            ].map(([title, body, href]) => (
              <a key={title} href={href} className="group grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{body}</p></div>
                <ArrowRight size={16} className="text-[#e7c66f] transition-transform duration-150 group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fcfbf8] py-14">
        <div className="shell grid gap-4 border-y border-black/[0.08] py-6 lg:grid-cols-[.35fr_1.65fr]">
          <p className="eyebrow">PTA & school blueprints</p>
          <p className="text-sm leading-6 text-[#667184]">We are deliberately not manufacturing generic school-event SEO pages. The stronger route is reusable school/PTA execution blueprints distributed through organizations, schools and parent groups.</p>
        </div>
      </section>
    </main>
  )
}
