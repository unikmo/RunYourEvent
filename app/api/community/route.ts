import { isSameOrigin } from '@/lib/request-origin'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { clean, integer, validSeasonalNeed, validUuid } from '@/lib/community-input'
export const runtime='nodejs'; export const dynamic='force-dynamic'
export async function POST(req:NextRequest) {
 try {
  if(!isSameOrigin(req)) return NextResponse.json({error:'Request origin is not allowed.'},{status:403})
  const raw=await req.text(); if(raw.length>16000) return NextResponse.json({error:'Request is too large.'},{status:413})
  let b; try { b=JSON.parse(raw) } catch {return NextResponse.json({error:'Invalid request.'},{status:400})}
  if(!b || typeof b!=='object' || Array.isArray(b)) return NextResponse.json({error:'Invalid request.'},{status:400})
  if(clean(b.website,200)) return NextResponse.json({ok:true})
  const store=await cookies(); const db=createServerClient()
  let result
  if(b.action==='seasonal_need') {
   if(!validSeasonalNeed(b)) return NextResponse.json({error:'Complete the required project details, dates, supervision and privacy acknowledgement.'},{status:400})
   result=await db.rpc('rye_submit_seasonal_need',{p_payload:b,p_club_token:store.get('rye_club_access')?.value||null})
  } else if(b.action==='sponsor_enquiry') {
   if(clean(b.organizationName,160).length<2 || clean(b.contactName,120).length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(b.email,254)) || b.privacyAck!==true || (b.needId && !validUuid(b.needId)) || (b.budgetCents!=null && !integer(b.budgetCents,1,100000000))) return NextResponse.json({error:'Complete the company, contact and privacy fields.'},{status:400})
   result=await db.rpc('rye_submit_community',{p_action:'sponsor_enquiry',p_payload:b})
  } else if(b.action==='join_activity') {
   const token=store.get('rye_volunteer_access')?.value
   if(!token) return NextResponse.json({error:'Join or open your personal invitation first.'},{status:401})
   if(!validUuid(b.opportunityId) || (b.groupCode && !/^[a-f0-9]{16}$/.test(b.groupCode))) return NextResponse.json({error:'Invalid activity or group link.'},{status:400})
   result=await db.rpc('rye_join_public_activity',{p_invite_token:token,p_opportunity_id:b.opportunityId,p_group_code:b.groupCode||null})
  } else if(b.action==='claim_reward') {
   const token=store.get('rye_volunteer_access')?.value
   if(!token) return NextResponse.json({error:'Open your volunteer passport first.'},{status:401})
   if(!validUuid(b.rewardId)) return NextResponse.json({error:'Invalid reward.'},{status:400})
   result=await db.rpc('rye_claim_reward',{p_invite_token:token,p_reward_id:b.rewardId})
  } else if(b.action==='respond_activity') {
   const token=store.get('rye_volunteer_access')?.value
   if(!token) return NextResponse.json({error:'Open your volunteer passport first.'},{status:401})
   if(!validUuid(b.placementId)||!['accept','decline','cancel','reconfirm','report_issue'].includes(b.response)) return NextResponse.json({error:'Invalid activity response.'},{status:400})
   result=await db.rpc('rye_passport_activity_action',{p_token:token,p_placement_id:b.placementId,p_action:b.response,p_message:clean(b.message)})
  } else return NextResponse.json({error:'Unknown action.'},{status:400})
  if(result.error) { console.error('Community request failed',result.error.code); return NextResponse.json({error:result.error.code==='P0001'?result.error.message:'The service is temporarily unavailable. Your request has not been saved.'},{status:result.error.code==='P0001'?409:503}) }
  const data=result.data as Record<string,unknown>|null
  const response=NextResponse.json({ok:true,status:b.action==='join_activity'?'accepted':undefined,redemptionDetails:b.action==='claim_reward'?data?.redemptionDetails:undefined,result:data && typeof data==='object'?{...data,accessToken:undefined}:data})
  if(b.action==='seasonal_need' && typeof data?.accessToken==='string') response.cookies.set('rye_club_access',data.accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*180})
  return response
 } catch {return NextResponse.json({error:'The service is temporarily unavailable. Your request has not been saved.'},{status:503})}
}
