import {cookies} from 'next/headers'
import {createServerClient} from '@/lib/supabase-server'
import WorkspaceRefresh from '@/components/WorkspaceRefresh'
import Link from 'next/link'
export const dynamic='force-dynamic'
export const metadata={title:'Invoice request status',robots:{index:false,follow:false},referrer:'no-referrer' as const}
export default async function Page({searchParams}:{searchParams:Promise<{order?:string}>}){
 const {order}=await searchParams;const token=(await cookies()).get('rye_order_access')?.value||'';let data:any=null;let unavailable=false
 try{if(order&&/^[a-f0-9-]{36}$/i.test(order)&&token){const r=await createServerClient().rpc('rye_order_status',{p_id:order,p_token:token});if(r.error)unavailable=true;else data=r.data}}catch{unavailable=true}
 const paid=data?.status==='paid',pending=data?.status==='pending'
 const title=unavailable?'Invoice status is temporarily unavailable.':!data?'We could not find this invoice request.':paid?'Your payment is recorded.':pending?'Your invoice request is recorded.':data.status==='review'?'This request needs review.':'This invoice request is closed.'
 const copy=unavailable?'We cannot confirm whether a request or payment was recorded. Please retry before submitting another request.':!data?'Open the request in the browser where it was created, or contact support with your invoice reference. This page has not confirmed a request or payment.':paid?'Full payment has been recorded. Funding and verified activity delivery are tracked separately.':pending?'An invoice is queued for email delivery with bank-transfer instructions. Sponsorship or employee booking activates after full payment is recorded. Please use the invoice reference when paying.':'Contact support before making a payment or requesting another invoice.'
 return <main className="shell max-w-3xl section-pad"><WorkspaceRefresh/><p className="eyebrow">Invoice request status</p><h1 className="premium-section mt-5">{title}</h1><p className="lede mt-6">{copy}</p>{paid&&data.kind==='sponsorship'&&<Link className="btn-primary mt-8" href={'/sponsor/'+token}>Open sponsor report</Link>}<Link className="text-link mt-6" href="/contact">Contact support →</Link></main>
}
