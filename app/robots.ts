import type { MetadataRoute } from 'next'
import { isPreview, privatePaths, siteUrl } from '@/lib/discovery'
export default function robots(): MetadataRoute.Robots {
  if(isPreview)return {rules:{userAgent:'*',disallow:'/'}}
  // Bot-specific groups must repeat private exclusions: they override the wildcard group.
  return {rules:[{userAgent:'*',allow:'/',disallow:privatePaths},{userAgent:['OAI-SearchBot','PerplexityBot','Claude-SearchBot'],allow:'/',disallow:privatePaths}],sitemap:siteUrl+'/sitemap.xml',host:siteUrl}
}
