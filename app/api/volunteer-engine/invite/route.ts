import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { stableFirestoreId } from '@/lib/firebase-firestore'
import { mirrorVolunteerActivityToFirebase, safeFirebaseMirror } from '@/lib/firebase-volunteer-mirror'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const COOKIE='rye_volunteer_access'

function token(value:unknown){return typeof value==='string'&&/^[a-f0-9]{48}$/i.test(value)?value:''}

export async function POST(req:NextRequest){
  try{
    const body=await req.json(); const inviteToken=token(body.token); const action=String(body.action||'')
    if(!inviteToken||!['accept','decline','reconfirm'].includes(action)) return NextResponse.json({error:'Invalid invitation action.'},{status:400})
    const db=createServerClient(); const {data,error}=await db.rpc('rye_volunteer_respond_invite',{p_invite_token:inviteToken,p_action:action})
    if(error||!data) return NextResponse.json({error:'This invitation cannot be updated in its current state.'},{status:409})

    await safeFirebaseMirror(mirrorVolunteerActivityToFirebase('invitation_response',{
      inviteTokenHash:stableFirestoreId(inviteToken),
      action,
      resultingStatus:String(data),
    }),'invitation response')

    const response=NextResponse.json({ok:true,status:data})
    if(action==='accept'||action==='reconfirm') response.cookies.set(COOKIE,inviteToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*180})
    if(action==='decline') response.cookies.delete(COOKIE)
    return response
  }catch(error){console.error('Volunteer invitation response failed',error);return NextResponse.json({error:'Invitation could not be updated.'},{status:500})}
}
