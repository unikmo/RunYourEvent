import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { mirrorOrganizerRequestToFirebase, safeFirebaseMirror } from '@/lib/firebase-volunteer-mirror'

export const runtime='nodejs'
export const dynamic='force-dynamic'

function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function email(value:unknown){const v=text(value,254).toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v:''}
function time(value:unknown){const v=text(value,5);return /^([01]\d|2[0-3]):[0-5]\d$/.test(v)?v:null}

export async function POST(req:NextRequest){
  try{
    const body=await req.json()
    if(text(body.website,200)) return NextResponse.json({ok:true})
    const organizationName=text(body.organizationName,160)
    const contactName=text(body.contactName,120)
    const contactEmail=email(body.email)
    const phone=text(body.phone,60)||null
    const city=text(body.city,120)
    const postalCode=text(body.postalCode,30)||null
    const pipeline=text(body.pipeline,30)
    const eventType=text(body.eventType,120)||null
    const eventName=text(body.eventName,160)||null
    const seasonLabel=text(body.seasonLabel,100)||null
    const roleExamples=text(body.roleExamples,1500)||null
    const notes=text(body.notes,2000)||null
    const coverageStatus=text(body.coverageStatus,30)
    const transportMode=text(body.transportMode,40)||'independent'
    const transportDetails=text(body.transportDetails,1000)||null
    const venue=text(body.venue,240)||null
    const volunteersNeeded=Number.parseInt(String(body.volunteersNeeded||''),10)
    const protectionRequired=coverageStatus!=='existing_confirmed'
    const protectionSelected=body.protectionSelected===true
    const protectionAck=body.protectionAck===true
    const eventDate=/^\d{4}-\d{2}-\d{2}$/.test(text(body.eventDate,10))?text(body.eventDate,10):null
    const shiftStart=time(body.shiftStartLocal)
    const shiftEnd=time(body.shiftEndLocal)
    const transportModes=['independent','public_transport','local_reimbursement','station_shuttle','organizer_transport']

    if(organizationName.length<2||contactName.length<2||!contactEmail||city.length<2||!['sports_club','one_off_event'].includes(pipeline)||!['existing_confirmed','not_covered','unknown'].includes(coverageStatus)||!Number.isInteger(volunteersNeeded)||volunteersNeeded<1||volunteersNeeded>500||body.responsibilityAck!==true||body.commercialAck!==true){
      return NextResponse.json({error:'Please complete the required organizer fields and acknowledgements.'},{status:400})
    }
    if(protectionRequired&&(!protectionSelected||!protectionAck)) return NextResponse.json({error:'Volunteer Protection Plus must be accepted when equivalent existing volunteer coverage is not confirmed.'},{status:400})
    if(pipeline==='one_off_event'){
      if(!eventDate||!shiftStart||!shiftEnd||!venue||!transportModes.includes(transportMode)||body.transportAck!==true){
        return NextResponse.json({error:'One-off events require an event date, 2–4 hour shift window, venue and transport-readiness confirmation.'},{status:400})
      }
      const [sh,sm]=shiftStart.split(':').map(Number); const [eh,em]=shiftEnd.split(':').map(Number); const duration=(eh*60+em)-(sh*60+sm)
      if(duration<120||duration>240) return NextResponse.json({error:'Volunteer micro-shifts must be between 2 and 4 hours.'},{status:400})
    }

    const db=createServerClient()
    const {data,error}=await db.rpc('rye_submit_volunteer_organizer_request_v3',{
      p_organization_name:organizationName,p_contact_name:contactName,p_contact_email:contactEmail,p_phone:phone,p_city:city,p_postal_code:postalCode,p_pipeline:pipeline,p_event_type:eventType,p_event_name:eventName,p_event_date:eventDate,p_season_label:seasonLabel,p_volunteers_needed:volunteersNeeded,p_role_examples:roleExamples,p_notes:notes,p_responsibility_ack:true,p_coverage_status:coverageStatus,p_protection_selected:protectionSelected,p_protection_ack:protectionAck,
      p_venue:venue,p_shift_start_local:shiftStart,p_shift_end_local:shiftEnd,p_transport_mode:transportMode,p_transport_details:transportDetails,p_transport_ack:body.transportAck===true,p_commercial_ack:true,
    })
    if(error||!data){console.error('Volunteer organizer intake failed',error);return NextResponse.json({error:error?.message?.includes('2 to 4 hours')?'Volunteer micro-shifts must be between 2 and 4 hours.':'The volunteer request could not be saved. Please try again.'},{status:503})}

    await safeFirebaseMirror(mirrorOrganizerRequestToFirebase({
      supabaseId:String(data),
      organizationName,
      contactName,
      contactEmail,
      phone,
      city,
      postalCode,
      pipeline,
      eventType,
      eventName,
      eventDate,
      seasonLabel,
      volunteersNeeded,
      roleExamples,
      notes,
      responsibilityAck:true,
      coverageStatus,
      protectionSelected,
      protectionAck,
      venue,
      shiftStartLocal:shiftStart,
      shiftEndLocal:shiftEnd,
      transportMode,
      transportDetails,
      transportAck:body.transportAck===true,
      commercialAck:true,
    }),'organizer request')

    return NextResponse.json({ok:true,requestId:data,protectionRequired,protectionSelected})
  }catch(error){console.error('Volunteer organizer intake failed',error);return NextResponse.json({error:'The volunteer request could not be submitted.'},{status:500})}
}
