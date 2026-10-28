import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://runyourevent.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/','/admin/','/club','/volunteer','/access','/conversations/','/sponsor/','/certificates/','/company/','/employee/','/billing','/notifications','/sponsorship/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
