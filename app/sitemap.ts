import type { MetadataRoute } from 'next'
import { SEO_ACQUISITION_PAGES } from '@/lib/seo-acquisition-all'

export default function sitemap():MetadataRoute.Sitemap {
  const base=process.env.NEXT_PUBLIC_SITE_URL||'https://runyourevent.com'
  const core=['','/volunteer-engine','/volunteer-engine/organizers','/volunteer-engine/volunteers','/event-types','/agencies','/venues','/templates','/browse','/resources','/custom','/pricing','/about','/contact','/imprint','/privacy','/terms','/my-events']
  const acquisition=SEO_ACQUISITION_PAGES.map(page=>`/${page.slug}`)
  const top=new Set(['/company-event-planning','/event-planning-checklist','/event-planning-template','/wedding-planning-checklist','/wedding-planning-timeline','/family-reunion-planning','/class-reunion-planning'])
  const expansionLead=new Set(['/destination-wedding-planning','/nonprofit-event-planning','/volunteer-event-planning','/sports-event-planning','/product-launch-event-planning','/fundraising-event-planning-checklist'])
  return [...core,...acquisition].map(path=>({
    url:`${base}${path}`,
    lastModified:new Date(),
    changeFrequency:path===''?'weekly' as const:'monthly' as const,
    priority:path===''?1:path==='/custom'?0.95:path==='/volunteer-engine'?0.93:path==='/company-event-planning'?0.92:top.has(path)?0.86:expansionLead.has(path)?0.8:0.72,
  }))
}
