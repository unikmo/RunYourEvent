import nodemailer from 'nodemailer'

const money=(c:number)=>(c/100).toFixed(2)+' EUR'
const escape=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
export function invoiceConfiguration(){
 const {BILLING_SELLER_NAME:name,BILLING_SELLER_ADDRESS:address,BILLING_TAX_NOTE:taxNote,BILLING_PAYMENT_INSTRUCTIONS:paymentInstructions}=process.env
 const bps=Number(process.env.BILLING_TAX_BPS)
 if(!name||!address||!taxNote||!paymentInstructions||!/^\d+$/.test(process.env.BILLING_TAX_BPS||'')||!Number.isInteger(bps)||bps<0||bps>10000)throw Error('Invoice seller, tax and bank-transfer configuration is required')
 return {name,address,taxNote,paymentInstructions,bps,taxId:process.env.BILLING_SELLER_TAX_ID||''}
}
export function renderInvoice(s:any){
 return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Invoice ${escape(s.number)}</title><style>body{font:15px system-ui;max-width:800px;margin:48px auto;padding:24px;color:#18233b}h1{font-size:28px}pre{font:inherit;white-space:pre-wrap}table{width:100%;border-collapse:collapse;margin:32px 0}td,th{text-align:left;border-bottom:1px solid #ddd;padding:12px}td:last-child,th:last-child{text-align:right}@media print{body{margin:0}}</style><h1>Invoice ${escape(s.number)}</h1><pre>${escape(s.seller.name)}\n${escape(s.seller.address)}\n${escape(s.seller.taxId)}</pre><h2>Bill to</h2><pre>${escape(s.customer.name)}\n${escape(s.customer.address)}\n${escape(s.customer.email)}</pre><p>Issued: ${escape(s.issuedAt.slice(0,10))} · Due: ${escape(s.dueAt.slice(0,10))}</p><table><thead><tr><th>Service</th><th>Amount</th></tr></thead><tbody>${s.lines.map((l:any)=>`<tr><td>${escape(l.description)}</td><td>${money(l.amountCents)}</td></tr>`).join('')}</tbody></table><p>Subtotal: ${money(s.subtotalCents)}</p><p>Tax (${s.seller.bps/100}%): ${money(s.taxCents)}</p><h2>Total: ${money(s.totalCents)}</h2><p>${escape(s.seller.taxNote)}</p><h2>Payment instructions</h2><pre>${escape(s.seller.paymentInstructions)}</pre><p>Use invoice reference: <strong>${escape(s.number)}</strong></p></html>`
}
export async function processInvoice(db:any,invoiceId:string,reminder=false){
 const {data:i,error}=await db.from('rye_invoices').select('*').eq('id',invoiceId).single()
 if(error||!i)throw Error('Invoice record unavailable')
 if(['paid','void','uncollectible'].includes(i.status))return
 if(i.needs_review)throw Error('Invoice requires attendance correction review')
 if(!reminder&&i.sent_at)return
 if(reminder&&(!i.sent_at||i.status!=='open'))return
 let snapshot=i.snapshot
 if(!snapshot){
  const seller=invoiceConfiguration()
  const {data:account,error:ae}=await db.from('rye_billing_accounts').select('*').eq('id',i.billing_account_id).single()
  if(ae||!account?.address)throw Error('Billing recipient address is required')
  let lines:any[]=[]
  if(i.order_id){
   const {data:o,error:oe}=await db.from('rye_orders').select('*').eq('id',i.order_id).single()
   if(oe||!o||o.status!=='pending'||o.amount_cents!==i.amount_cents)throw Error('Order requires reconciliation')
   lines=[{description:o.kind==='sponsorship'?'Community sponsorship · '+o.id:'Agreed corporate volunteering project · '+o.booking_id,amountCents:o.amount_cents}]
  }else{
   const {data:charges,error:ce}=await db.from('rye_charges').select('*').eq('invoice_id',i.id)
   if(ce||!charges?.length||charges.some((c:any)=>c.status==='review')||charges.reduce((n:number,c:any)=>n+c.amount_cents,0)!==i.amount_cents)throw Error('Invoice line items require reconciliation')
   for(const c of charges){const {data:p,error:pe}=await db.from('rye_volunteer_placements').select('opportunity_id,checked_out_at,organizer_verified').eq('id',c.placement_id).single();if(pe||!p?.organizer_verified)throw Error('Attendance is not verified');lines.push({description:(c.kind==='placement'?'Verified completed placement':'Agreed volunteer protection')+' · '+c.placement_id+' · service date '+p.checked_out_at?.slice(0,10),amountCents:c.amount_cents})}
  }
  const issuedAt=new Date().toISOString(),dueAt=new Date(Date.now()+14*86400000).toISOString(),taxCents=Math.round(i.amount_cents*seller.bps/10000)
  const stored=await db.rpc('rye_store_invoice_snapshot',{p_id:i.id,p_snapshot:{number:i.invoice_number,seller,customer:{name:account.name,email:account.email,address:account.address},lines,issuedAt,dueAt,subtotalCents:i.amount_cents,taxCents,totalCents:i.amount_cents+taxCents}})
  if(stored.error||!stored.data)throw Error('Invoice snapshot could not be stored');snapshot=stored.data
 }
 if(!process.env.SMTP_HOST||!process.env.SMTP_FROM)throw Error('SMTP delivery is not configured')
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',requireTLS:process.env.SMTP_PORT!=='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000})
 const html=renderInvoice(snapshot)
 const sent=await transport.sendMail({from:process.env.SMTP_FROM,to:snapshot.customer.email,subject:(reminder?'Payment reminder · ':'Invoice · ')+snapshot.number,messageId:`<rye-invoice-${i.id}${reminder?'-reminder-'+new Date().toISOString().slice(0,10):''}@${new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://runyourevent.com').hostname}>`,text:`Invoice ${snapshot.number}\nTotal: ${money(snapshot.totalCents)}\nDue: ${snapshot.dueAt.slice(0,10)}\n\n${snapshot.seller.paymentInstructions}\nReference: ${snapshot.number}\n\nThe itemized invoice is attached. Contact us if attendance or billing needs review.`,attachments:[{filename:snapshot.number+'.html',content:html,contentType:'text/html'}]})
 if(!sent.accepted?.length||sent.rejected?.length)throw Error('Invoice email was not accepted')
 const marked=await db.rpc('rye_mark_invoice_sent',{p_id:i.id});if(marked.error||!marked.data)throw Error('Invoice delivery acknowledgement failed')
}
