import {systemText} from './german'
import nodemailer from 'nodemailer'
import {getServerSupabase} from '@/lib/supabase-server'
import {processInvoice} from '@/lib/invoice-core'

export async function runAutomation(){
 const db=getServerSupabase();const tick=await db.rpc('rye_worker_tick');if(tick.error)throw new Error('Automation database is unavailable')
 if(process.env.OPERATIONS_EMAIL&&process.env.SMTP_HOST)await db.rpc('rye_enqueue_ops_alert',{p_email:process.env.OPERATIONS_EMAIL})
 const rewards=await db.rpc('rye_deliver_milestone_rewards');if(rewards.error)throw new Error('Milestone reward delivery unavailable')
 const reminders=await db.rpc('rye_invoice_reminders');if(reminders.error)throw new Error('Invoice reminder queue unavailable')
 const claimed=await db.rpc('rye_claim_jobs',{p_limit:20});if(claimed.error)throw new Error('Job queue unavailable')
 const jobs=claimed.data||[];let done=0;let failed=0
 for(const job of jobs){
  let error:string|null=null
  try{
   if(job.kind==='email'){
    if(!process.env.SMTP_HOST||!process.env.SMTP_FROM)throw new Error('SMTP delivery is not configured')
    const base=new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://runyourevent.com');const href=String(job.payload.href||'/notifications')
    if(!href.startsWith('/')||href.startsWith('//'))throw new Error('Invalid notification link')
    const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',requireTLS:process.env.SMTP_PORT!=='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000})
    const sent=await transport.sendMail({from:process.env.SMTP_FROM,to:job.payload.to,subject:systemText(String(job.payload.subject||'')),text:systemText(String(job.payload.body||''))+'\n\n'+new URL(href,base).toString(),messageId:`<rye-${job.id}@${base.hostname}>`})
    if(!sent.accepted?.length||sent.rejected?.length)throw new Error('SMTP delivery was not accepted')
   }else if(job.kind==='invoice')await processInvoice(db,job.payload.invoiceId,job.payload.reminder===true)
   else throw new Error('Unknown job type')
   done++
  }catch(e){error=e instanceof Error?e.message.slice(0,200):'Provider operation failed';failed++}
  const finished=await db.rpc('rye_finish_job',{p_id:job.id,p_lease:job.lease_token,p_error:error});if(finished.error)throw new Error('Job acknowledgement failed')
 }
 return {done,failed,claimed:jobs.length}
}
