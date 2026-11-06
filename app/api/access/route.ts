import { isSameOrigin } from '@/lib/request-origin'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const noStore={'Cache-Control':'private, no-store'}

export async function POST(request:NextRequest) {
  const origin=request.headers.get('origin')
  if(!isSameOrigin(request))return NextResponse.json({error:'This request could not be verified.'},{status:403,headers:noStore})
  try {
    const raw=await request.text()
    if(raw.length>12000)return NextResponse.json({error:'This request is too large.'},{status:413,headers:noStore})
    let body
    try{body=JSON.parse(raw)}catch{return NextResponse.json({error:'Enter a valid request.'},{status:400,headers:noStore})}
    if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'Enter a valid request.'},{status:400,headers:noStore})
    const email=typeof body.email==='string'?body.email.trim().toLowerCase():''
    const role=body.role==='club'?'club':body.role==='volunteer'?'volunteer':null
    if(!role)return NextResponse.json({error:'Choose an account type.'},{status:400,headers:noStore})
    if(body.action!=='verify_session'&&(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return NextResponse.json({error:'Enter your registration email and choose an account type.'},{status:400,headers:noStore})
    const db=createServerClient()
    if(body.action==='send_code') {
      const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:origin+'/access?role='+role}})
      if(error)return NextResponse.json({error:'We could not send a sign-in code. Wait a moment and try again.'},{status:error.status===429?429:503,headers:noStore})
      return NextResponse.json({ok:true,message:'Check your email for a sign-in link or code. Use the email address attached to your volunteer profile or club requests.'},{headers:noStore})
    }
    let providerAccessToken=''
    if(body.action==='verify_session') {
      if(typeof body.accessToken!=='string'||body.accessToken.length<100||body.accessToken.length>8192||typeof body.refreshToken!=='string'||body.refreshToken.length<16||body.refreshToken.length>2048)return NextResponse.json({error:'This sign-in link is invalid. Request a new email and try again.'},{status:400,headers:noStore})
      const {data,error}=await db.auth.setSession({access_token:body.accessToken,refresh_token:body.refreshToken})
      if(error||!data.session)return NextResponse.json({error:'This sign-in link is invalid or has expired. Request a new email and try again.'},{status:401,headers:noStore})
      providerAccessToken=data.session.access_token
    } else {
      if(body.action!=='verify_code'||typeof body.code!=='string'||!/^\d{6,8}$/.test(body.code.trim()))return NextResponse.json({error:'Enter the code from your sign-in email.'},{status:400,headers:noStore})
      const {data:verified,error}=await db.auth.verifyOtp({email,token:body.code.trim(),type:'email'})
      if(error||!verified.session)return NextResponse.json({error:'This code is invalid or has expired. Request a new email and try again.'},{status:401,headers:noStore})
      providerAccessToken=verified.session.access_token
    }
    const {data:{user},error:userError}=await db.auth.getUser(providerAccessToken)
    if(userError||!user||!user.email||!user.email_confirmed_at||(body.action!=='verify_session'&&user.email.toLowerCase()!==email))return NextResponse.json({error:'Your email could not be verified. Request a new email and try again.'},{status:401,headers:noStore})
    const {data,error:recoverError}=await db.rpc('rye_recover_account',{p_role:role})
    const accessToken=data&&typeof data==='object'&&typeof (data as {accessToken?:unknown}).accessToken==='string'?(data as {accessToken:string}).accessToken:''
    if(recoverError||!/^[a-f0-9]{48}$/i.test(accessToken))return NextResponse.json({error:'No accessible record could be opened. Check the account type and email address, or create your first profile or club request.'},{status:404,headers:noStore})
    const response=NextResponse.json({ok:true,redirect:role==='club'?'/club':'/volunteer'},{headers:noStore})
    response.cookies.set(role==='club'?'rye_club_access':'rye_volunteer_access',accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*180})
    return response
  }catch{return NextResponse.json({error:'Sign-in is temporarily unavailable. Please try again later.'},{status:503,headers:noStore})}
}
