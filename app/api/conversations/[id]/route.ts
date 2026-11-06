import { isSameOrigin } from '@/lib/request-origin'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic='force-dynamic'
export const runtime='nodejs'

async function credentials(id:string) {
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return null
  const jar=await cookies();const volunteer=jar.get('rye_volunteer_access')?.value||'';const club=jar.get('rye_club_access')?.value||''
  const p_volunteer_token=/^[a-f0-9]{48}$/.test(volunteer)?volunteer:null
  const p_club_token=/^[a-f0-9]{48}$/.test(club)?club:null
  return p_volunteer_token||p_club_token?{p_volunteer_token,p_club_token,p_placement_id:id}:null
}

export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;const access=await credentials(id)
  if(!access)return NextResponse.json({error:'Open your club workspace or personal volunteer invitation first.'},{status:401})
  try {
    const {data,error}=await createServerClient().rpc('rye_conversation',access)
    if(error||!data)return NextResponse.json({error:'This conversation is unavailable.'},{status:404})
    return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}})
  }catch{return NextResponse.json({error:'The conversation is temporarily unavailable.'},{status:503})}
}

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const origin=request.headers.get('origin')
  if(!isSameOrigin(request))return NextResponse.json({error:'This request could not be verified.'},{status:403})
  const {id}=await params;const access=await credentials(id)
  if(!access)return NextResponse.json({error:'Open your club workspace or personal volunteer invitation first.'},{status:401})
  try {
    const body=await request.json()
    const message=typeof body.message==='string'?body.message.trim():''
    if(!message||message.length>2000)return NextResponse.json({error:'Enter a message of up to 2,000 characters.'},{status:400})
    const {data,error}=await createServerClient().rpc('rye_send_message',{...access,p_message:message})
    if(error||!data)return NextResponse.json({error:'The message could not be sent. Check your access and try again.'},{status:400})
    return NextResponse.json({ok:true,result:data},{headers:{'Cache-Control':'private, no-store'}})
  }catch{return NextResponse.json({error:'The message could not be sent. Please try again.'},{status:503})}
}
