import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime='nodejs'
export const dynamic='force-dynamic'

function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function email(value:unknown){const v=text(value,254).toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v:''}

export async function POST(req:NextRequest){
  try{
    const body=await req.json()
    if(text(body.website,200)) return NextResponse.json({ok:true})
    const organizationName=text(body.organizationName,160)
    const contactName=text(body.contactName,120)
    const contactEmail=email(body.email)
    const city=text(body.city,120)
    const pipeline=text(body.pipeline,30)
    const coverageStatus=text(body.coverageStatus,30)
    const volunteersNeeded=Number.parseInt(String(body.volunteersNeeded||''),10)
    const protectionRequired=coverageStatus!=='existing_confirmed'
    const protectionSelected=body.protectionSelected===true
    const protectionAck=body.protectionAck===true
    if(organizationName.length<2||contactName.length<2||!contactEmail||city.length<2||!['sports_club','one_off_event'].includes(pipeline)||!['existing_confirmed','not_covered','unknown'].includes(coverageStatus)||!Number.isInteger(volunteersNeeded)||volunteersNeeded<1||volunteersNeeded>500||body.responsibilityAck!==true){
      return NextResponse.json({error:'Please complete the required organizer, coverage and responsibility fields.'},{status:400})
    }
    if(protectionRequired&&(!protectionSelected||!protectionAck)){
      return NextResponse.json({error:'Volunteer Protection Plus must be accepted when equivalent existing volunteer coverage is not confirmed.'},{status:400})
    }
    const eventDate=/^\d{4}-\d{2}-\d{2}$/.test(text(body.eventDate,10))?text(body.eventDate,10):null
    const db=createServerClient()
    const {data,error}=await db.rpc('rye_submit_volunteer_organizer_request_v2',{
      p_organization_name:organizationName,
      p_contact_name:contactName,
      p_contact_email:contactEmail,
      p_phone:text(body.phone,60)||null,
      p_city:city,
      p_postal_code:text(body.postalCode,30)||null,
      p_pipeline:pipeline,
      p_event_type:text(body.eventType,120)||null,
      p_event_name:text(body.eventName,160)||null,
      p_event_date:eventDate,
      p_season_label:text(body.seasonLabel,100)||null,
      p_volunteers_needed:volunteersNeeded,
      p_role_examples:text(body.roleExamples,1500)||null,
      p_notes:text(body.notes,2000)||null,
      p_responsibility_ack:true,
      p_coverage_status:coverageStatus,
      p_protection_selected:protectionSelected,
      p_protection_ack:protectionAck,
    })
    if(error||!data){console.error('Volunteer organizer intake failed',error);return NextResponse.json({error:'The volunteer request could not be saved. Please try again.'},{status:503})}
    return NextResponse.json({ok:true,requestId:data,protectionRequired,protectionSelected})
  }catch(error){console.error('Volunteer organizer intake failed',error);return NextResponse.json({error:'The volunteer request could not be submitted.'},{status:500})}
}
