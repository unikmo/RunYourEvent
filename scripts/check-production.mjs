// Read-only release checks. Never sends email, starts jobs or creates records.
import nextEnv from '@next/env'
import {createClient} from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
nextEnv.loadEnvConfig(process.cwd())
const env=process.env
let failures=0
const check=(label,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failures++;return ok}
const present=key=>typeof env[key]==='string'&&env[key].trim().length>0
check('Production canonical URL',env.NEXT_PUBLIC_SITE_URL==='https://runyourevent.com')
const dbConfigured=check('EventEngine database URL and API keys',env.NEXT_PUBLIC_SUPABASE_URL==='https://iemibyzizrvoxdxskfsx.supabase.co'&&present('NEXT_PUBLIC_SUPABASE_ANON_KEY')&&present('SUPABASE_SERVICE_ROLE_KEY'))
check('Worker secret has at least 32 characters',(env.CRON_SECRET||'').length>=32)
check('Operations alert recipient',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.OPERATIONS_EMAIL||''))
for(const key of ['BILLING_SELLER_NAME','BILLING_SELLER_ADDRESS','BILLING_TAX_NOTE','BILLING_PAYMENT_INSTRUCTIONS'])check(key,present(key))
check('Explicit tax rate in basis points',/^\d+$/.test(env.BILLING_TAX_BPS||'')&&Number(env.BILLING_TAX_BPS)<=10000)
const smtpConfigured=check('SMTP host and sender',present('SMTP_HOST')&&present('SMTP_FROM'))
check('SMTP authentication pair',!!env.SMTP_USER===!!env.SMTP_PASSWORD)
check('SMTP TLS port',['465','587'].includes(env.SMTP_PORT||'587'))
if(dbConfigured){
 const anon=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
 const service=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
 for(const [label,params] of [['Worldwide',{}],['Country',{p_country:'DE'}],['City',{p_country:'DE',p_city:'Siegburg'}]]){
  try{const r=await anon.rpc('rye_champsboard',params).abortSignal(AbortSignal.timeout(10000));check(label+' Champsboard',!r.error&&Array.isArray(r.data?.items))}catch{check(label+' Champsboard',false)}
 }
 try{const r=await anon.rpc('rye_sponsor_report',{p_token:'release-check-invalid-token'}).abortSignal(AbortSignal.timeout(10000));check('Invalid sponsor token returns no private report',!r.error&&r.data===null)}catch{check('Invalid sponsor token returns no private report',false)}
 try{const r=await service.from('rye_admin_users').select('id',{head:true,count:'exact'}).eq('is_active',true).abortSignal(AbortSignal.timeout(10000));check('Service access and active administrator',!r.error&&r.count>0)}catch{check('Service access and active administrator',false)}
}
if(smtpConfigured){
 const transport=nodemailer.createTransport({host:env.SMTP_HOST,port:Number(env.SMTP_PORT||587),secure:env.SMTP_PORT==='465',requireTLS:env.SMTP_PORT!=='465',auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000})
 try{await transport.verify();check('SMTP connection and authentication (no email sent)',true)}catch{check('SMTP connection and authentication (no email sent)',false)}finally{transport.close()}
}
console.log('Manual release checks still required: Auth email delivery and redirects, scheduler activation, browser journeys, invoice recipient and bank details, production smoke test.')
console.log(`${failures} automated release check(s) failed. No settings or records changed.`)
process.exitCode=failures?1:0
