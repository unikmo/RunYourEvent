import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import Conversation from '@/components/Conversation'

export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Activity Conversation | RunYourEvent',robots:{index:false,follow:false}}

export default async function ConversationPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;const jar=await cookies()
  const volunteerToken=jar.get('rye_volunteer_access')?.value||'';const clubToken=jar.get('rye_club_access')?.value||''
  let conversation:null|{title:string;messages:any[]}=null
  if(/^[a-f0-9-]{36}$/.test(id)&&(/^[a-f0-9]{48}$/.test(volunteerToken)||/^[a-f0-9]{48}$/.test(clubToken))) {
    try {const {data,error}=await createServerClient().rpc('rye_conversation',{p_volunteer_token:volunteerToken||null,p_club_token:clubToken||null,p_placement_id:id});if(!error&&data)conversation=data}catch{}
  }
  if(!conversation)return <main className="shell py-20"><h1 className="text-3xl font-black">This conversation is unavailable.</h1><p className="lede mt-5">Use the device where you joined, or open your personal invitation link. Only the volunteer and the host club can access the placement conversation.</p><div className="mt-7 flex gap-3"><Link className="btn-primary" href="/club">Club workspace</Link><Link className="btn-secondary" href="/volunteer">Volunteer workspace</Link></div></main>
  return <main className="shell max-w-4xl py-16"><p className="eyebrow">Direct coordination</p><h1 className="mt-5 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{conversation.title}</h1><p className="mt-4 text-sm leading-7 text-[#667184]">Keep activity plans and practical questions together. This conversation checks for new messages every 15 seconds while open.</p><Conversation placementId={id} messages={conversation.messages||[]} /></main>
}
