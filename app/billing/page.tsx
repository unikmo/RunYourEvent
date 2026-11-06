import {cookies} from 'next/headers'
import Link from 'next/link'
import {createServerClient} from '@/lib/supabase-server'
import BillingPanel from '@/components/BillingPanel'
export const dynamic='force-dynamic';export const metadata={title:"Rechnungen für deinen Verein",robots:{index:false,follow:false}}
export default async function Page(){const token=(await cookies()).get('rye_club_access')?.value||'';if(!token)return <main className="shell section-pad"><h2 className="page-title section-title">Rechnungen für deinen Verein</h2><Link className="btn-primary mt-6" href="/access?role=club">Bei deinem Verein anmelden</Link></main>;let data;try{const r=await createServerClient().rpc('rye_club_billing',{p_token:token});data=r.data}catch{}return <main className="shell max-w-4xl section-pad"><p className="eyebrow">Dein Vereinskonto</p><h2 className="page-title mt-5">Klare Gebühren. Übersichtliche Abrechnung.</h2>{data?<BillingPanel billing={data}/>:<p className="mt-8">Die Abrechnungsdaten lassen sich gerade nicht laden. Rechnungs- und Zahlungsstände können wir hier im Moment nicht bestätigen.</p>}</main>}
