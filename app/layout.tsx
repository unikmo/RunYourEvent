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
    default: 'RunYourEvent | Spieltage planen. Helfer finden.',
    template: '%s | RunYourEvent',
  },
  description: 'RunYourEvent hilft Sportvereinen, Spieltage und Vereinsveranstaltungen zu strukturieren und offene Aufgaben in klare Helferschichten zu teilen.',
  applicationName: 'RunYourEvent',
  category: 'Vereins- und Eventorganisation',
  keywords: [
    'Helfer für Sportverein finden',
    'Spieltag organisieren',
    'Helferplan Sportverein',
    'ehrenamtliche Helfer finden',
    'Vereinsfest Helfer',
    'Turnier Helfer',
    '2 Stunden helfen',
  ],
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'RunYourEvent',
    title: 'RunYourEvent | Dein Spieltag. Alle Aufgaben. Alle Helfer.',
    description: 'Spieltage planen, Aufgaben aufteilen und Helfer für klare 2-Stunden-Schichten finden.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RunYourEvent | Spieltage planen. Helfer finden.',
    description: '2 Stunden helfen. Fertig.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.className} min-h-screen`}>
        <a className="skip-link" href="#main-content">Zum Inhalt springen</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
