import WorkspaceRefresh from '@/components/WorkspaceRefresh'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ClubWorkspace from '@/components/ClubWorkspace'

export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Club Workspace | RunYourEvent',robots:{index:false,follow:false}}

export default async function ClubPage() {
  const token=(await cookies()).get('rye_club_access')?.value||''
  if(!/^[a-f0-9]{48}$/.test(token))return <main className="shell py-20"><p className="eyebrow">Your club workspace</p><h1 className="premium-section mt-5 max-w-3xl">Plan it. Publish it.<br/>Run it together.</h1><p className="lede mt-6">Submit your first seasonal need to create your club workspace on this device. Then publish activities, invite local volunteers, message your team and verify completed time.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/seasonal-needs" className="btn-primary">Start with your club’s needs</Link><Link href="/access?role=club" className="btn-secondary">Open an existing club workspace</Link></div></main>
  try {
    const {data,error}=await createServerClient().rpc('rye_club_workspace',{p_token:token})
    if(error||!data)return <main className="shell py-20"><h1 className="text-3xl font-black">Your club workspace could not be loaded.</h1><p className="lede mt-5">Please try again. If your session has expired, verify your registration email to open your existing workspace.</p><Link href="/access?role=club" className="btn-primary mt-6">Sign in to your club workspace</Link></main>
    return <main className="bg-[#f7f5ef]"><section className="shell py-16"><p className="eyebrow">Your club workspace</p><h1 className="premium-section mt-5 max-w-4xl">Your needs. Your people.<br/>One clear plan.</h1><p className="lede mt-6">Publish safe, well-defined activities, invite suitable local volunteers and coordinate directly. Review completed attendance before it counts toward recognition.</p><WorkspaceRefresh/><ClubWorkspace workspace={data} /></section></main>
  }catch{return <main className="shell py-20"><h1 className="text-3xl font-black">The club workspace is temporarily unavailable.</h1><p className="lede mt-5">Please try again later. Your existing needs remain saved.</p></main>}
}
