import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Event Execution Resources & Planning Guides | RunYourEvent',
  description: 'Event execution guides for company events, weddings, reunions, nonprofit and volunteer events, community events, celebrations, checklists, templates and timelines.',
  alternates: { canonical: '/resources' },
}

const clusters = [
  { title: 'Execution foundations', items: [
    ['Event planning checklist', 'Turn a static checklist into owners, deadlines, dependencies and completion criteria.', '/event-planning-checklist'],
    ['Event planning template', 'Start from structured event logic, then adapt it to the actual date, team and operating context.', '/event-planning-template'],
    ['Event planning timeline', 'Build the schedule backwards from the fixed date and replan when reality changes.', '/event-planning-timeline'],
    ['Event execution plan', 'Understand the difference between remembering work and controlling delivery.', '/event-execution-plan'],
  ] },
  { title: 'Company & business events', items: [
    ['Company event planning', 'Primary commercial guide for company and corporate event execution.', '/company-event-planning'],
    ['Corporate event planning checklist', 'Cross-functional checklist with owners, approvals and dependencies.', '/corporate-event-planning-checklist'],
    ['Company retreat planning', 'Venue, travel, agenda, hospitality, confidentiality and contingencies.', '/company-retreat-planning'],
    ['Company offsite planning', 'Team outcomes, travel, workshops, meals and on-site execution.', '/offsite-event-planning'],
    ['Product launch event planning', 'Product, messaging, press, production, demo readiness and launch-day control.', '/product-launch-event-planning'],
    ['Small business event planning', 'Right-sized execution for openings, workshops, customer events and launches.', '/small-business-event-planning'],
  ] },
  { title: 'Weddings & celebrations', items: [
    ['Wedding planning checklist', 'Venue, guests, vendors, deadlines and wedding-day execution.', '/wedding-planning-checklist'],
    ['Wedding planning timeline', 'Build the wedding schedule backwards from the fixed date.', '/wedding-planning-timeline'],
    ['Destination wedding planning', 'Travel, accommodation, local vendors, transfers and multi-location delivery.', '/destination-wedding-planning'],
    ['Birthday party planning checklist', 'A right-sized checklist for milestone birthdays and larger celebrations.', '/birthday-party-planning-checklist'],
    ['Graduation party planning checklist', 'Coordinate ceremony timing, guests, food, setup and celebration-day responsibilities.', '/graduation-party-planning-checklist'],
  ] },
  { title: 'Reunions', items: [
    ['Family reunion planning', 'Coordinate travel, stays, meals, activities and distributed family responsibilities.', '/family-reunion-planning'],
    ['Family reunion checklist', 'Turn family commitments into owners, deadlines and event-day responsibilities.', '/family-reunion-checklist'],
    ['Class reunion planning', 'Give volunteer committees clear ownership for outreach, venue, program and event day.', '/class-reunion-planning'],
  ] },
  { title: 'Nonprofit, volunteer & community', items: [
    ['Nonprofit event planning', 'Mission, program, donors, sponsors, volunteers and financial controls.', '/nonprofit-event-planning'],
    ['Volunteer event planning', 'Execution discipline for volunteer-led events without pretending to be volunteer-management software.', '/volunteer-event-planning'],
    ['Charity event planning', 'Supporters, sponsors, volunteers, fundraising moments and public-facing delivery.', '/charity-event-planning'],
    ['Fundraising event planning checklist', 'Donor experience, giving mechanics, sponsors and financial readiness.', '/fundraising-event-planning-checklist'],
    ['Church event planning', 'Ministry teams, facilities, hospitality, volunteers, safety and program handoffs.', '/church-event-planning'],
    ['Community event planning', 'Permits, partners, public-space logistics, volunteers, safety and site handback.', '/community-event-planning'],
    ['Sports event planning', 'Venue readiness, participants, officials, equipment, safety and live operations.', '/sports-event-planning'],
  ] },
]

export default function Page() {
  return (
    <main className="bg-[#fcfbf8]">
      <section className="border-b border-black/[0.06]">
        <div className="shell py-20 sm:py-24">
          <p className="eyebrow">Resources</p>
          <h1 className="display mt-5 max-w-5xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">Planning guides that lead to execution—not another pile of generic checklists.</h1>
          <p className="lede mt-7">Find the planning language you searched for, then use it to build the stronger operating model behind delivery: owners, dependencies, deadlines, readiness and Run of Show.</p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="shell space-y-16">
          {clusters.map(cluster => (
            <section key={cluster.title} className="grid gap-8 lg:grid-cols-[.38fr_1.62fr]">
              <div><p className="eyebrow">{cluster.title}</p></div>
              <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
                {cluster.items.map(([title, body, href]) => (
                  <a key={title} href={href} className="group grid gap-3 py-5 sm:grid-cols-[.72fr_1.28fr_auto] sm:items-center">
                    <h2 className="font-black tracking-[-0.02em] text-[#15233f]">{title}</h2>
                    <p className="text-sm leading-6 text-[#667184]">{body}</p>
                    <ArrowRight size={15} className="text-[#9a741c] transition-transform duration-150 group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="section-pad border-t border-black/[0.06] bg-[#f4f1e9]">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Ready to move beyond the guide?</p>
            <h2 className="section-title mt-4">Turn the event into an operating plan.</h2>
          </div>
          <a href="/custom" className="btn-primary">Build my event plan <ArrowRight className="ml-2" size={15} /></a>
        </div>
      </section>
    </main>
  )
}
