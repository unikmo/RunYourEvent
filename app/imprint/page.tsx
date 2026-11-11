import { pageMetadata } from '@/lib/discovery'
import type { Metadata } from 'next'
import LegalDocument from '@/components/LegalDocument'
import { imprintMd } from '@/lib/legal-content'
export const metadata:Metadata=pageMetadata({title:'Impressum',description:"Anbieter und Kontaktdaten von RunYourEvent, einem Angebot für freiwilliges Engagement im Sport von PlanetHike OÜ in Tallinn, Estland.",alternates:{canonical:'/imprint'}})
export default function Page(){return <main className="bg-[#fbfaf7]"><article className="shell max-w-4xl py-10"><p className="eyebrow">Impressum</p><h1 className="page-title mt-4">Impressum</h1><div className="mt-6"><LegalDocument md={imprintMd}/></div></article></main>}
