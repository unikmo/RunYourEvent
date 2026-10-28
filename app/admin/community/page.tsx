import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'
import CommunityOpsConsole from '@/components/CommunityOpsConsole'

export const dynamic = 'force-dynamic'
export default async function CommunityAdminPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  const db = createServerClient()
  const { data, error } = await db.rpc('rye_admin_community_dashboard', { p_token: session.token })
  return <main className="min-h-screen bg-[#f5f2ea]"><section className="shell py-12"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow">RunYourEvent operations</p><h1 className="display mt-3 text-4xl font-black sm:text-5xl">Community & sponsorship</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-[#667184]">Review club needs, allocate sponsorship and manage verified recognition. Contacts and operational records on this page are restricted to administrators.</p></div><a href="/admin/volunteer-engine" className="btn-secondary">Volunteer operations</a></div>{error || !data ? <div role="alert" className="panel mt-8 p-7"><h2 className="font-black">Operations data is temporarily unavailable.</h2><p className="mt-3 text-sm text-[#667184]">No action has been taken. Refresh this page to try again.</p></div> : <CommunityOpsConsole data={data}/>}</section></main>
}
