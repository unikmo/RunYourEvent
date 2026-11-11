import { pageMetadata } from '@/lib/discovery'
import LegalDocument from '@/components/LegalDocument'
import { termsMd } from '@/lib/legal-content'
export const metadata=pageMetadata({title:'Nutzungsbedingungen für RunYourEvent',description:'Bedingungen für freiwillige Einsätze, Vereinsgebühren, Sponsoring, Teameinsätze, bestätigte Stunden und Urkunden.',alternates:{canonical:'/terms'}})
export default function Page(){return <main className="bg-[#fbfaf7]"><article className="shell max-w-4xl py-12"><p className="eyebrow">Nutzungsbedingungen</p><h1 className="page-title mt-4">Nutzungsbedingungen</h1><div className="mt-6"><LegalDocument md={termsMd}/></div></article></main>}
