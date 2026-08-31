import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'

export const runtime='nodejs'; export const dynamic='force-dynamic'

export async function POST(req:NextRequest){
  try{
    const session=await getAdminSession(); if(!session) return NextResponse.json({error:'Unauthorized'},{status:401})
    const b=await req.json(); if(!b.opportunityId||!b.volunteerId) return NextResponse.json({error:'Select a shift and volunteer.'},{status:400})
    const db=createServerClient(); const {data,error}=await db.rpc('rye_admin_invite_volunteer',{p_token:session.token,p_opportunity_id:b.opportunityId,p_volunteer_id:b.volunteerId})
    if(error||!data) return NextResponse.json({error:error?.message||'Invitation could not be created.'},{status:400})
    const base=process.env.NEXT_PUBLIC_SITE_URL||'https://runyourevent.com'; return NextResponse.json({ok:true,inviteUrl:`${base}/volunteer-engine/invite/${data}`})
  }catch(error){console.error(error);return NextResponse.json({error:'Invitation could not be created.'},{status:500})}
}
