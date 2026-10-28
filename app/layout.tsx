import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://runyourevent.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'RunYourEvent | Sports Volunteer Platform', template: '%s | RunYourEvent' },
  description: 'Find local sports volunteering, bring an employee team or get the help your club needs. Companies and organisations can join practical projects or sponsor local clubs, with verified hours and shared contribution.',
  applicationName: 'RunYourEvent',
  category: 'Sports Volunteer Platform',
  keywords: ['sports volunteering','sports club volunteers','football volunteers','2 hour volunteering','student volunteer hours','community service certificate','matchday volunteers','sports volunteer platform'],
  alternates: { canonical: '/' },
  openGraph: { type:'website', url:'/', siteName:'RunYourEvent', title:'RunYourEvent | Sports Volunteer Platform', description:'Give 2–4 hours. Help sport happen.' },
  twitter: { card:'summary_large_image', title:'RunYourEvent | Sports Volunteer Platform', description:'Sports volunteering in clear 2–4 hour activities.' },
  robots: { index:true, follow:true, googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1} },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={inter.className + ' min-h-screen'}><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader/><div id="main-content">{children}</div><SiteFooter/></body></html>
}
