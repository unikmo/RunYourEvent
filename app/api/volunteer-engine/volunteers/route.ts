import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { mirrorVolunteerProfileToFirebase, safeFirebaseMirror } from '@/lib/firebase-volunteer-mirror'

export const runtime='nodejs'
export const dynamic='force-dynamic'

function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function email(value:unknown){const v=text(value,254).toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v:''}

export async function POST(req:NextRequest){
  try{
    const body=await req.json()
    if(text(body.website,200)) return NextResponse.json({ok:true})
    const firstName=text(body.firstName,80)
    const lastName=text(body.lastName,80)
    const contactEmail=email(body.email)
    const city=text(body.city,120)
    const postalCode=text(body.postalCode,30)||null
    const ageBand=text(body.ageBand,20)
    const schoolOrUniversity=text(body.schoolOrUniversity,160)||null
    const interests=text(body.interests,1500)||null
    const availability=text(body.availability,1500)||null
    const validAge=['16_17','18_20','21_25','26_plus'].includes(ageBand)
    if(!firstName||!lastName||!contactEmail||city.length<2||!validAge||body.privacyAck!==true){
      return NextResponse.json({error:'Please complete the required registration fields.'},{status:400})
    }
    if(ageBand==='16_17'&&body.guardianConsentReady!==true){
      return NextResponse.json({error:'For the 16–17 age group, confirm that parent or guardian consent can be provided where required.'},{status:400})
    }
    const db=createServerClient()
    const {data,error}=await db.rpc('rye_submit_volunteer_profile',{
      p_first_name:firstName,
      p_last_name:lastName,
      p_email:contactEmail,
      p_city:city,
      p_postal_code:postalCode,
      p_age_band:ageBand,
      p_school_or_university:schoolOrUniversity,
      p_interests:interests,
      p_availability:availability,
      p_guardian_consent_ready:body.guardianConsentReady===true,
      p_privacy_ack:true,
    })
    if(error||!data){console.error('Volunteer registration failed',error);return NextResponse.json({error:'The volunteer profile could not be saved. Please try again.'},{status:503})}

    await safeFirebaseMirror(mirrorVolunteerProfileToFirebase({
      supabaseId:String(data),
      firstName,
      lastName,
      email:contactEmail,
      city,
      postalCode,
      ageBand,
      schoolOrUniversity,
      interests,
      availability,
      guardianConsentReady:body.guardianConsentReady===true,
      privacyAck:true,
    }),'volunteer profile')

    return NextResponse.json({ok:true,profileId:data})
  }catch(error){console.error('Volunteer registration failed',error);return NextResponse.json({error:'Registration could not be submitted.'},{status:500})}
}
