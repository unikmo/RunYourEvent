import { isSameOrigin } from '@/lib/request-origin'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const actions = new Set(['approve_need','create_campaign','allocate_funding','create_reward','issue_certificate','revoke_certificate','verify_placement','link_opportunity','redeem_reward','resolve_issue','activate_corporate','reserve_placement_funding','correct_attendance'])
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({error:'Your admin session has expired. Sign in again.'},{status:401})
    const origin=req.headers.get('origin')
    if(!isSameOrigin(req)) return NextResponse.json({error:'Request origin is not allowed.'},{status:403})
    if(Number(req.headers.get('content-length')||0)>20000) return NextResponse.json({error:'Request is too large.'},{status:413})
    let body
    try { body = await req.json() } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
    if(!body||!actions.has(body.action)||!body.payload||typeof body.payload!=='object'||Array.isArray(body.payload)) return NextResponse.json({error:'Select a valid operation and complete its fields.'},{status:400})
    const db = createServerClient()
    const {data,error}=await db.rpc('rye_admin_community_action',{p_token:session.token,p_action:body.action,p_payload:body.payload})
    if(error) return NextResponse.json({error:error.message||'The operation could not be completed.'},{status:400})
    return NextResponse.json({ok:true,result:data})
  } catch(error) {
    console.error('Community admin operation failed',error)
    return NextResponse.json({error:'The operation could not be completed. Please try again.'},{status:500})
  }
}
