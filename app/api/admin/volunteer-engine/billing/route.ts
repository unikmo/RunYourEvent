import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createServerClient } from '@/lib/supabase-server'

export const runtime='nodejs'; export const dynamic='force-dynamic'

async function stripe(path:string,params:Record<string,string>){
  const secret=process.env.STRIPE_SECRET_KEY
  if(!secret) throw new Error('STRIPE_SECRET_KEY is not configured for Volunteer Engine invoicing.')
  const response=await fetch(`https://api.stripe.com/v1${path}`,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params),cache:'no-store'})
  const json=await response.json(); if(!response.ok) throw new Error(json?.error?.message||'Stripe request failed.'); return json
}

export async function POST(req:NextRequest){
  const session=await getAdminSession(); if(!session) return NextResponse.json({error:'Unauthorized'},{status:401})
  const db=createServerClient(); let billingRunId=''
  try{
    const {requestId}=await req.json(); if(!requestId) return NextResponse.json({error:'Organizer request is required.'},{status:400})
    const prepared=await db.rpc('rye_admin_prepare_volunteer_invoice',{p_token:session.token,p_request_id:requestId})
    if(prepared.error||!prepared.data) return NextResponse.json({error:prepared.error?.message||'No billable attendance.'},{status:409})
    const b=prepared.data as any; billingRunId=b.billingRunId
    const customer=await stripe('/customers',{email:b.customerEmail,name:b.organizationName,'metadata[runyourevent_request_id]':b.requestId})
    await stripe('/invoiceitems',{customer:customer.id,currency:'eur',amount:String(b.placementAmountCents),description:`RunYourEvent Volunteer Engine · ${b.successfulPlacements} attended placement${b.successfulPlacements===1?'':'s'} at €${(b.unitFeeCents/100).toFixed(2)}`})
    if(b.protectionAmountCents>0) await stripe('/invoiceitems',{customer:customer.id,currency:'eur',amount:String(b.protectionAmountCents),description:`Volunteer Protection Plus · ${b.protectionVolunteerDays} covered volunteer-day${b.protectionVolunteerDays===1?'':'s'} at €1.50`})
    const invoice=await stripe('/invoices',{customer:customer.id,collection_method:'send_invoice',days_until_due:'7',auto_advance:'false',description:'RunYourEvent Volunteer Engine attendance invoice','metadata[runyourevent_billing_run_id]':billingRunId,'metadata[runyourevent_request_id]':b.requestId})
    await stripe(`/invoices/${invoice.id}/finalize`,{})
    const sent=await stripe(`/invoices/${invoice.id}/send`,{})
    await db.rpc('rye_admin_mark_volunteer_invoice',{p_token:session.token,p_billing_run_id:billingRunId,p_status:'sent',p_stripe_invoice_id:invoice.id})
    return NextResponse.json({ok:true,invoiceId:invoice.id,hostedInvoiceUrl:sent.hosted_invoice_url,totalAmountCents:b.totalAmountCents})
  }catch(error){
    console.error('Volunteer invoice failed',error)
    if(billingRunId) await db.rpc('rye_admin_mark_volunteer_invoice',{p_token:session.token,p_billing_run_id:billingRunId,p_status:'failed',p_stripe_invoice_id:''})
    return NextResponse.json({error:error instanceof Error?error.message:'Volunteer invoice could not be sent.'},{status:503})
  }
}
