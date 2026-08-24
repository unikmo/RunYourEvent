import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://runyourevent.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RunYourEvent | Event Execution Platform',
    template: '%s | RunYourEvent',
  },
  description:
    'Turn an event idea into an executable operating plan with clear workstreams, tasks, owners, dependencies, approvals, risks and deadlines.',
  applicationName: 'RunYourEvent',
  category: 'Event Execution Platform',
  keywords: [
    'event execution software',
    'event operations software',
    'event task management',
    'event execution plan',
    'event timeline software',
    'corporate event operations',
    'event agency software',
    'event planning templates',
    'wedding task management',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'RunYourEvent',
    title: 'RunYourEvent | Event Execution Platform',
    description: 'Plan it. Assign it. Run it. Turn an event into a connected operating plan from first decision to final delivery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RunYourEvent | Event Execution Platform',
    description: 'Every task. Every owner. Every deadline.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
