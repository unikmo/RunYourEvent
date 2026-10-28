import {notFound} from 'next/navigation'
import {createServerClient} from '@/lib/supabase-server'
import CompanyWorkspace from '@/components/CompanyWorkspace'
export const dynamic='force-dynamic';export const metadata={title:'Employee volunteering workspace',robots:{index:false,follow:false},referrer:'no-referrer' as const}
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!/^[a-f0-9]{48}$/.test(token))notFound();const {data,error}=await createServerClient().rpc('rye_company_workspace',{p_token:token});if(error||!data)notFound();return <main className="shell max-w-5xl section-pad"><p className="eyebrow">Your company project</p><h1 className="premium-section mt-5">A useful day. A coordinated team.</h1><CompanyWorkspace token={token} data={data}/></main>}
