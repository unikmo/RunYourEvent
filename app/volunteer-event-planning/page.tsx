import type { Metadata } from 'next'
import SeoAcquisitionPage from '@/components/SeoAcquisitionPage'

export const metadata:Metadata={
  title:'Volunteer Event Planning, Recruitment & Micro-Shifts | RunYourEvent',
  description:'Plan volunteer-led events with owners and deadlines, then use RunYourEvent Volunteer Engine to recruit local volunteers into clear 2–4 hour micro-shifts.',
  alternates:{canonical:'/volunteer-event-planning'},
}

export default function Page(){return <SeoAcquisitionPage
  slug="volunteer-event-planning"
  eyebrow="Volunteer event planning"
  title="Plan the volunteer-led event—and recruit the hands needed to run it"
  lead="RunYourEvent connects the event execution plan with Volunteer Engine micro-shifts, so committee responsibilities and event-day staffing no longer live in separate systems."
  intro="Volunteer-led events need two different kinds of control. The core execution plan makes decisions, owners, dependencies and deadlines visible. Volunteer Engine handles the short event-day staffing gaps that are better filled through flexible 2–4 hour micro-shifts."
  workstreams={['Committee governance','Venue & permissions','Program & activities','Supplies & suppliers','Volunteer recruitment & micro-shifts','Event-day handoffs']}
  steps={[
    {title:'Define accountable owners',body:'Separate committee decision owners from delivery owners and identify event-day roles that still need people.'},
    {title:'Convert staffing gaps into shifts',body:'Break suitable event-day work into clear 2–4 hour roles with a place, time window, briefing and age requirement.'},
    {title:'Recruit through Volunteer Engine',body:'Use the seasonal sports-club pipeline or success-based one-off event placement model to source local volunteers.'},
    {title:'Run the handoffs',body:'Keep volunteer arrivals, briefing, role ownership, contingencies and event-day execution connected to the wider operating plan.'},
  ]}
  outputs={['Committee workstreams with accountable owners','Concrete 2–4 hour volunteer micro-shifts','Recruitment requirements connected to event-day needs','Organizer responsibility and briefing requirements made explicit','Volunteer participation records and verified progress','Event-day Run of Show and handoffs']}
  pitfalls={['A committee assumes “someone will help” without defining the actual role or time window.','Volunteer recruitment begins before role suitability, supervision and briefing requirements are clear.','One absent volunteer silently owns a critical event-day dependency.','Staffing lists and the event execution plan diverge as the date approaches.']}
  cta="Build my event plan"
  faqs={[
    {q:'Does RunYourEvent now recruit volunteers?',a:'Yes. Volunteer Engine is the RunYourEvent module for sourcing local volunteers into defined 2–4 hour micro-shifts, while the core platform continues to manage the wider event execution plan.'},
    {q:'How is Volunteer Engine priced?',a:'Seasonal sports clubs are €200 per season. One-off events pay per successful placement: €25 each for 1–5, €20 each for 6–15 and €15 each for 16 or more.'},
    {q:'Who is responsible for volunteers on site?',a:'The host organization remains responsible for supervision, role briefing, safeguarding, role suitability, required insurance, permissions, safety and applicable local compliance. The exact legal allocation is governed by the applicable terms and law.'},
  ]}
  related={[
    {title:'Volunteer Engine',href:'/volunteer-engine'},
    {title:'Sports event planning',href:'/sports-event-planning'},
    {title:'Nonprofit event planning',href:'/nonprofit-event-planning'},
    {title:'Community event planning',href:'/community-event-planning'},
  ]}
/>}
