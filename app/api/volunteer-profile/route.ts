import {countries} from '@/lib/countries'
import { isSameOrigin } from '@/lib/request-origin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic='force-dynamic'
export async function POST(request:NextRequest) {
  if(!isSameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403})
  try {
    const token=(await cookies()).get('rye_volunteer_access')?.value||''
    if(!/^[a-f0-9]{48}$/i.test(token))return NextResponse.json({error:'Open and accept your personal activity invitation to access your profile.'},{status:401})
    const body=await request.json()
    const displayName=typeof body.displayName==='string'?body.displayName.trim():''
    const slug=typeof body.slug==='string'?body.slug.trim():''
    if(displayName.length<2||displayName.length>80||slug.length<3||slug.length>60||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||typeof body.publicEnabled!=='boolean')return NextResponse.json({error:'Enter a display name and a valid page address using lowercase letters, numbers and hyphens.'},{status:400})
    const country=typeof body.country==='string'?body.country.toUpperCase():''
    if((country&&!countries.some(c=>c.code===country))||typeof body.champsboardEnabled!=='boolean'||body.champsboardEnabled&&(!country||!body.publicEnabled))return NextResponse.json({error:'Choose a country and publish your profile to join the Champsboard.'},{status:400})
    const db=createServerClient()
    const passport=await db.rpc('rye_my_volunteer_passport',{p_invite_token:token})
    if(passport.error)return NextResponse.json({error:'Profile settings are temporarily unavailable. Please try again later.'},{status:503})
    if(!passport.data)return NextResponse.json({error:'Your volunteer session is no longer available.'},{status:401})
    if(body.publicEnabled&&passport.data.profile?.age_band==='16_17')return NextResponse.json({error:'Public volunteer pages are available from age 18.'},{status:403})
    const {data,error}=await db.rpc('rye_save_public_profile',{p_token:token,p_display_name:displayName,p_public:body.publicEnabled,p_slug:slug,p_champsboard:body.champsboardEnabled,p_country:country})
    if(error||data===false)return NextResponse.json({error:'These settings could not be saved. The page address may already be taken; try another address.'},{status:409})
    return NextResponse.json({ok:true})
  }catch{return NextResponse.json({error:'Profile settings could not be saved. Please try again later.'},{status:503})}
}
