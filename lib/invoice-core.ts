import nodemailer from 'nodemailer'

const money=(c:number)=>new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(c/100)+' EUR'
const date=(value:string)=>new Intl.DateTimeFormat('de-DE',{timeZone:'UTC'}).format(new Date(value))
const escape=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
export function invoiceConfiguration(){
 const {BILLING_SELLER_NAME:name,BILLING_SELLER_ADDRESS:address,BILLING_TAX_NOTE:taxNote,BILLING_PAYMENT_INSTRUCTIONS:paymentInstructions}=process.env
 const bps=Number(process.env.BILLING_TAX_BPS)
 if(!name||!address||!taxNote||!paymentInstructions||!/^\d+$/.test(process.env.BILLING_TAX_BPS||'')||!Number.isInteger(bps)||bps<0||bps>10000)throw Error('Invoice seller, tax and bank-transfer configuration is required')
 return {name,address,taxNote,paymentInstructions,bps,taxId:process.env.BILLING_SELLER_TAX_ID||''}
}
export function renderInvoice(s:any){
 return `<!doctype html><html lang="de"><meta charset="utf-8"><title>Rechnung ${escape(s.number)}</title><style>body{font:15px system-ui;max-width:800px;margin:48px auto;padding:24px;color:#18233b}h1{font-size:28px}pre{font:inherit;white-space:pre-wrap}table{width:100%;border-collapse:collapse;margin:32px 0}td,th{text-align:left;border-bottom:1px solid #ddd;padding:12px}td:last-child,th:last-child{text-align:right}@media print{body{margin:0}}</style><h1>Rechnung ${escape(s.number)}</h1><pre>${escape(s.seller.name)}\n${escape(s.seller.address)}\n${escape(s.seller.taxId)}</pre><h2>Rechnung an</h2><pre>${escape(s.customer.name)}\n${escape(s.customer.address)}\n${escape(s.customer.email)}</pre><p>Ausgestellt: ${escape(date(s.issuedAt))} · Fällig: ${escape(date(s.dueAt))}</p><table><thead><tr><th>Leistung</th><th>Betrag</th></tr></thead><tbody>${s.lines.map((l:any)=>`<tr><td>${escape(l.description)}</td><td>${money(l.amountCents)}</td></tr>`).join('')}</tbody></table><p>Zwischensumme: ${money(s.subtotalCents)}</p><p>Steuer (${(s.seller.bps/100).toLocaleString('de-DE')}%): ${money(s.taxCents)}</p><h2>Gesamt: ${money(s.totalCents)}</h2><p>${escape(s.seller.taxNote)}</p><h2>Überweisungsdaten</h2><pre>${escape(s.seller.paymentInstructions)}</pre><p>Bitte gib als Verwendungszweck an: <strong>${escape(s.number)}</strong></p></html>`
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
   lines=[{description:o.kind==='sponsorship'?'Sponsoring freiwilliger Einsätze · '+o.id:'Vereinbarter Teameinsatz · '+o.booking_id,amountCents:o.amount_cents}]
  }else{
   const {data:charges,error:ce}=await db.from('rye_charges').select('*').eq('invoice_id',i.id)
   if(ce||!charges?.length||charges.some((c:any)=>c.status==='review')||charges.reduce((n:number,c:any)=>n+c.amount_cents,0)!==i.amount_cents)throw Error('Invoice line items require reconciliation')
   for(const c of charges){const {data:p,error:pe}=await db.from('rye_volunteer_placements').select('opportunity_id,checked_out_at,organizer_verified').eq('id',c.placement_id).single();if(pe||!p?.organizer_verified)throw Error('Attendance is not verified');lines.push({description:(c.kind==='placement'?'Bestätigter Einsatz':'Vereinbarter Versicherungsschutz')+' · '+c.placement_id+' · Leistungsdatum '+p.checked_out_at?.slice(0,10),amountCents:c.amount_cents})}
  }
  const issuedAt=new Date().toISOString(),dueAt=new Date(Date.now()+14*86400000).toISOString(),taxCents=Math.round(i.amount_cents*seller.bps/10000)
  const stored=await db.rpc('rye_store_invoice_snapshot',{p_id:i.id,p_snapshot:{number:i.invoice_number,seller,customer:{name:account.name,email:account.email,address:account.address},lines,issuedAt,dueAt,subtotalCents:i.amount_cents,taxCents,totalCents:i.amount_cents+taxCents}})
  if(stored.error||!stored.data)throw Error('Invoice snapshot could not be stored');snapshot=stored.data
 }
 if(!process.env.SMTP_HOST||!process.env.SMTP_FROM)throw Error('SMTP delivery is not configured')
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',requireTLS:process.env.SMTP_PORT!=='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000})
 const html=renderInvoice(snapshot)
 const sent=await transport.sendMail({from:process.env.SMTP_FROM,to:snapshot.customer.email,subject:(reminder?'Zahlungserinnerung · ':'Rechnung · ')+snapshot.number,messageId:`<rye-invoice-${i.id}${reminder?'-reminder-'+new Date().toISOString().slice(0,10):''}@${new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://runyourevent.com').hostname}>`,text:`Rechnung ${snapshot.number}\nGesamt: ${money(snapshot.totalCents)}\nFällig: ${date(snapshot.dueAt)}\n\n${snapshot.seller.paymentInstructions}\nVerwendungszweck: ${snapshot.number}\n\nDeine detaillierte Rechnung findest du im Anhang. Falls die Teilnahme oder Abrechnung geprüft werden muss, melde dich bitte bei uns.`,attachments:[{filename:snapshot.number+'.html',content:html,contentType:'text/html'}]})
 if(!sent.accepted?.length||sent.rejected?.length)throw Error('Invoice email was not accepted')
 const marked=await db.rpc('rye_mark_invoice_sent',{p_id:i.id});if(marked.error||!marked.data)throw Error('Invoice delivery acknowledgement failed')
}
