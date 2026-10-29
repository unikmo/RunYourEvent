import type { Metadata } from 'next'

// Canonicals describe the public site, never a temporary preview host.
export const siteUrl = 'https://runyourevent.com'
export const isPreview = process.env.VERCEL_ENV === 'preview'
export function pageMetadata(input: Metadata): Metadata {
  const title = typeof input.title === 'string' ? input.title : input.title && 'absolute' in input.title ? input.title.absolute : 'RunYourEvent'
  const path = String(input.alternates?.canonical || '/')
  return {
    ...input,
    title: { absolute: title.includes('RunYourEvent') ? title : `${title} | RunYourEvent` },
    openGraph: { type: 'website', locale: 'de_DE', siteName: 'RunYourEvent', title, description: input.description || '', url: path },
    twitter: { card: 'summary', title, description: input.description || '' },
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
  }
}
export const privatePaths = ['/api/', '/admin', '/club$', '/volunteer$', '/access', '/conversations/', '/sponsor/', '/certificates/', '/volunteers/', '/company/', '/employee/', '/billing', '/notifications', '/sponsorship/', '/events/', '/share/', '/workspace/', '/checkout/', '/volunteer-engine/check-in', '/volunteer-engine/invite/']
export const publicPaths = ['', '/volunteer-engine', '/volunteer-engine/volunteers', '/pricing', '/sponsors', '/corporate', '/recognition', '/champsboard', '/opportunities', '/activities', '/seasonal-needs', '/about', '/contact', '/imprint', '/privacy', '/terms', '/guides', '/faq']
