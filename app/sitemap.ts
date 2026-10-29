import type { MetadataRoute } from 'next'
import { publicPaths, siteUrl } from '@/lib/discovery'
import { guides } from '@/lib/volunteering-guides'
export default function sitemap():MetadataRoute.Sitemap {
  // No invented lastModified timestamp: builds do not prove editorial updates.
  return [...publicPaths,...guides.map(g=>'/'+g.slug)].map(path=>({url:siteUrl+path,changeFrequency:path===''?'weekly' as const:'monthly' as const,priority:path===''?1:0.7}))
}
