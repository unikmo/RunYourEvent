import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import StructuredData from '@/components/StructuredData'
import { guides } from '@/lib/volunteering-guides'
import { pageMetadata, siteUrl } from '@/lib/discovery'
export const dynamicParams=false
export function generateStaticParams(){return guides.map(g=>({seoSlug:g.slug}))}
export async function generateMetadata({params}:{params:Promise<{seoSlug:string}>}):Promise<Metadata>{
  const {seoSlug}=await params;const guide=guides.find(g=>g.slug===seoSlug)
  if(!guide)return {}
  return pageMetadata({title:guide.title,description:guide.description,alternates:{canonical:`/${guide.slug}`}})
}
export default async function Page({params}:{params:Promise<{seoSlug:string}>}){
  const {seoSlug}=await params;const guide=guides.find(g=>g.slug===seoSlug);if(!guide)notFound()
  return <main className="shell max-w-5xl py-8 sm:py-12">
    <StructuredData data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:"Startseite",item:siteUrl+'/'},{'@type':'ListItem',position:2,name:"Tipps für dein Engagement",item:siteUrl+'/guides'},{'@type':'ListItem',position:3,name:guide.title,item:siteUrl+'/'+guide.slug}]}}/>
    <nav aria-label="Seitennavigation" className="text-sm text-[#667184]"><Link className="underline" href="/guides">Tipps für dein Engagement</Link> / Ratgeber</nav>
    <article><p className="eyebrow mt-8">Tipps für dein Engagement</p><h1 className="premium-section mt-4 max-w-4xl">{guide.title}</h1><p className="lede mt-6">{guide.intro}</p><div className="mt-10 space-y-10">{guide.sections.map(s=><section key={s.title}><h2 className="text-2xl font-black">{s.title}</h2><p className="mt-4 max-w-3xl leading-8 text-[#667184]">{s.body}</p></section>)}</div><Link className="btn-primary mt-10" href={guide.cta.href}>{guide.cta.label} →</Link></article>
    <aside className="mt-12 border-t pt-8"><h2 className="text-xl font-black">Weitere Ratgeber</h2><ul className="mt-5 space-y-3">{guides.filter(g=>g.slug!==seoSlug).map(g=><li key={g.slug}><Link className="underline underline-offset-4" href={'/'+g.slug}>{g.title}</Link></li>)}</ul><Link className="text-link mt-6" href="/faq">Häufige Fragen →</Link></aside>
  </main>
}
