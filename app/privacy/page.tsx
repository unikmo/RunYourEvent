import { pageMetadata } from '@/lib/discovery'
import LegalDocument from '@/components/LegalDocument'
import { privacyMd } from '@/lib/legal-content'
export const metadata=pageMetadata({title:'Datenschutzerklärung',description:'So verarbeitet RunYourEvent deine Daten: Zwecke, Rechtsgrundlagen, Speicherdauer, Dienstleister und deine Rechte.',alternates:{canonical:'/privacy'}})
export default function Page(){return <main className="bg-[#fbfaf7]"><article className="shell max-w-4xl py-12"><p className="eyebrow">Datenschutz</p><h1 className="page-title mt-4">Datenschutzerklärung</h1><div className="mt-6"><LegalDocument md={privacyMd}/></div></article></main>}
