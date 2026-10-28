import {cookies} from 'next/headers'
import Link from 'next/link'
import {createServerClient} from '@/lib/supabase-server'
import BillingPanel from '@/components/BillingPanel'
export const dynamic='force-dynamic';export const metadata={title:'Club billing',robots:{index:false,follow:false}}
export default async function Page(){const token=(await cookies()).get('rye_club_access')?.value||'';if(!token)return <main className="shell section-pad"><h1 className="section-title">Club billing</h1><Link className="btn-primary mt-6" href="/access?role=club">Sign in to your club</Link></main>;let data;try{const r=await createServerClient().rpc('rye_club_billing',{p_token:token});data=r.data}catch{}return <main className="shell max-w-4xl section-pad"><p className="eyebrow">Club account</p><h1 className="premium-section mt-5">Clear fees. Automatic records.</h1>{data?<BillingPanel billing={data}/>:<p className="mt-8">Billing is temporarily unavailable. No payment has been confirmed.</p>}</main>}
