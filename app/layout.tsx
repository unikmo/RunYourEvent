import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LegacyProductNotice from '@/components/LegacyProductNotice'
import './globals.css'
import StructuredData from '@/components/StructuredData'
import { siteUrl, isPreview } from '@/lib/discovery'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'RunYourEvent | Sports Volunteer Platform', template: '%s | RunYourEvent' },
  description: 'Find local sports volunteering, bring an employee team or get the help your club needs. Companies and organisations can join practical projects or sponsor local clubs, with verified hours and shared contribution.',
  applicationName: 'RunYourEvent',
  category: 'Sports Volunteer Platform',
  keywords: ['sports volunteering','sports club volunteers','football volunteers','2 hour volunteering','student volunteer hours','community service certificate','matchday volunteers','sports volunteer platform'],
  alternates: { canonical: '/' },
  openGraph: { type:'website', url:'/', siteName:'RunYourEvent', title:'RunYourEvent | Sports Volunteer Platform', description:'Give 2–4 hours. Help sport happen.' },
  twitter: { card:'summary', title:'RunYourEvent | Sports Volunteer Platform', description:'Sports volunteering in clear 2–4 hour activities.' },
  robots: { index:!isPreview, follow:!isPreview, googleBot:{index:!isPreview,follow:!isPreview,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1} },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={inter.className + ' min-h-screen'}><a className="skip-link" href="#main-content">Skip to content</a><StructuredData data={{'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':siteUrl+'/#organization',name:'RunYourEvent',url:siteUrl,parentOrganization:{'@type':'Organization',name:'PlanetHike OÜ'}},{'@type':'WebSite','@id':siteUrl+'/#website',name:'RunYourEvent',url:siteUrl,publisher:{'@id':siteUrl+'/#organization'},inLanguage:'en'}]}}/><SiteHeader/><LegacyProductNotice/><div id="main-content">{children}</div><SiteFooter/></body></html>
}
