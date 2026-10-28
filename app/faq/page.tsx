import Link from 'next/link'
import { faqs } from '@/lib/volunteering-guides'
import { pageMetadata } from '@/lib/discovery'
import StructuredData from '@/components/StructuredData'
export const metadata=pageMetadata({title:'Sports volunteering and sponsorship FAQ',description:'Answers about fees, 25-hour sponsorship enquiries, employee projects, verified hours, certificates and optional rankings.',alternates:{canonical:'/faq'}})
export default function Page(){return <main className="shell max-w-4xl py-8 sm:py-12"><StructuredData data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}}/><p className="eyebrow">Questions, answered</p><h1 className="premium-section mt-5">How RunYourEvent works.</h1><div className="mt-10 divide-y">{faqs.map(f=><section className="py-7" key={f.q}><h2 className="text-xl font-black">{f.q}</h2><p className="mt-4 leading-8 text-[#667184]">{f.a}</p></section>)}</div><div className="mt-8 flex flex-wrap gap-4"><Link className="btn-primary" href="/contact">Contact us</Link><Link className="btn-secondary" href="/guides">Read the guides</Link></div></main>}
