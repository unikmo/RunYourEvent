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
  title: { default: "RunYourEvent | Freiwilliges Engagement im Sport", template: '%s | RunYourEvent' },
  description: "Hilf im Sportverein, bring dein Team mit oder finde Unterstützung für deinen Verein. Unternehmen und Organisationen können selbst anpacken oder freiwillige Einsätze finanzieren.",
  applicationName: 'RunYourEvent',
  category: "Freiwilliges Engagement im Sport",
  keywords: ["freiwilliges Engagement im Sport","Freiwillige für Sportvereine","Helfer im Fußballverein","zwei Stunden freiwillig helfen","Engagementstunden für Schüler und Studierende","Nachweis für freiwilliges Engagement","Helfer am Spieltag","Plattform für freiwilliges Engagement im Sport"],
  alternates: { canonical: '/' },
  openGraph: { type:'website', locale:'de_DE', url:'/', siteName:'RunYourEvent', title:"RunYourEvent | Freiwilliges Engagement im Sport", description:"Hilf 2–4 Stunden. Mach Sport vor Ort möglich." },
  twitter: { card:'summary', title:"RunYourEvent | Freiwilliges Engagement im Sport", description:"Freiwillig im Sport helfen – mit klaren Aufgaben für 2–4 Stunden." },
  robots: { index:!isPreview, follow:!isPreview, googleBot:{index:!isPreview,follow:!isPreview,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1} },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de"><body className={inter.className + ' min-h-screen'}><a className="skip-link" href="#main-content">Zum Inhalt springen</a><StructuredData data={{'@context':'https://schema.org','@graph':[{'@type':"Organisation",'@id':siteUrl+'/#organization',name:'RunYourEvent',url:siteUrl,parentOrganization:{'@type':"Organisation",name:'PlanetHike OÜ'}},{'@type':'WebSite','@id':siteUrl+'/#website',name:'RunYourEvent',url:siteUrl,publisher:{'@id':siteUrl+'/#organization'},inLanguage:'de'}]}}/><SiteHeader/><LegacyProductNotice/><div id="main-content">{children}</div><SiteFooter/></body></html>
}
