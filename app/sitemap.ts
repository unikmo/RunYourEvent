import type { MetadataRoute } from 'next'

export default function sitemap():MetadataRoute.Sitemap {
  const base=process.env.NEXT_PUBLIC_SITE_URL||'https://runyourevent.com'
  const core=['','/volunteer-engine','/volunteer-engine/volunteers','/pricing','/sponsors','/corporate','/recognition','/champsboard','/opportunities','/activities','/seasonal-needs','/about','/contact','/imprint','/privacy','/terms']
  return core.map(path=>({
    url:base+path,
    lastModified:new Date(),
    changeFrequency:path===''?'weekly' as const:'monthly' as const,
    priority:path===''?1:path==='/volunteer-engine'?0.95:path.includes('/organizers')||path.includes('/volunteers')?0.92:0.7,
  }))
}
