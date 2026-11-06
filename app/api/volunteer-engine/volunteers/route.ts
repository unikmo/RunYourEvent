import { isSameOrigin } from '@/lib/request-origin'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime='nodejs'
export const dynamic='force-dynamic'

function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function email(value:unknown){const v=text(value,254).toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v:''}

export async function POST(req:NextRequest){
  try{
    if(!isSameOrigin(req)) return NextResponse.json({error:'Request origin is not allowed.'},{status:403})
    const raw=await req.text();if(raw.length>12000)return NextResponse.json({error:'Request is too large.'},{status:413})
    const body=JSON.parse(raw)
    if(text(body.website,200)) return NextResponse.json({ok:true})
    const firstName=text(body.firstName,80)
    const lastName=text(body.lastName,80)
    const contactEmail=email(body.email)
    const city=text(body.city,120)
    const ageBand=text(body.ageBand,20)
    const validAge=['16_17','18_20','21_25','26_plus'].includes(ageBand)
    if(!firstName||!lastName||!contactEmail||city.length<2||!validAge||body.privacyAck!==true){
      return NextResponse.json({error:'Please complete the required registration fields.'},{status:400})
    }
    if(ageBand==='16_17'&&body.guardianConsentReady!==true){
      return NextResponse.json({error:'For the 16–17 age group, confirm that parent or guardian consent can be provided where required.'},{status:400})
    }
    const db=createServerClient()
    const {data,error}=await db.rpc('rye_register_volunteer',{p_payload:body})
    if(error||!data) return NextResponse.json({error:'The volunteer profile could not be saved. Please try again.'},{status:503})
    const result=data as {created:boolean;accessToken?:string}
    const response=NextResponse.json({ok:true,created:result.created})
    if(result.accessToken) response.cookies.set('rye_volunteer_access',result.accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*180})
    return response
  }catch(error){console.error('Volunteer registration failed',error);return NextResponse.json({error:'Registration could not be submitted.'},{status:500})}
}
