import {cookies} from 'next/headers'
import {createServerClient} from '@/lib/supabase-server'
import WorkspaceRefresh from '@/components/WorkspaceRefresh'
import Link from 'next/link'
export const dynamic='force-dynamic'
export const metadata={title:"Stand deiner Rechnungsanfrage",robots:{index:false,follow:false},referrer:'no-referrer' as const}
export default async function Page({searchParams}:{searchParams:Promise<{order?:string}>}){
 const {order}=await searchParams;const token=(await cookies()).get('rye_order_access')?.value||'';let data:any=null;let unavailable=false
 try{if(order&&/^[a-f0-9-]{36}$/i.test(order)&&token){const r=await createServerClient().rpc('rye_order_status',{p_id:order,p_token:token});if(r.error)unavailable=true;else data=r.data}}catch{unavailable=true}
 const paid=data?.status==='paid',pending=data?.status==='pending'
 const title=unavailable?"Der Rechnungsstand lässt sich gerade nicht laden.":!data?"Diese Rechnungsanfrage wurde nicht gefunden.":paid?"Deine Zahlung wurde erfasst.":pending?"Deine Rechnungsanfrage wurde erfasst.":data.status==='review'?"Diese Anfrage muss geprüft werden.":"Diese Rechnungsanfrage ist abgeschlossen."
 const copy=unavailable?"Wir können gerade nicht prüfen, ob eine Anfrage oder Zahlung erfasst wurde. Bitte versuch es später erneut, bevor du eine weitere Anfrage sendest.":!data?"Öffne die Anfrage im Browser, in dem du sie erstellt hast. Alternativ kontaktiere uns mit deiner Rechnungsnummer. Auf dieser Seite wurde keine Anfrage oder Zahlung bestätigt.":paid?"Die vollständige Zahlung wurde erfasst. Finanzierung und tatsächlich bestätigte Einsatzstunden werden getrennt geführt.":pending?"Die Rechnung mit den Überweisungsdaten ist für den E-Mail-Versand vorgemerkt. Dein Sponsoring oder Teameinsatz wird nach Erfassung der vollständigen Zahlung freigeschaltet. Gib bei der Überweisung bitte die Rechnungsnummer an.":"Bitte kontaktiere uns, bevor du zahlst oder eine weitere Rechnung anforderst."
 return <main className="shell max-w-3xl section-pad"><WorkspaceRefresh/><p className="eyebrow">Stand deiner Rechnungsanfrage</p><h1 className="premium-section mt-5">{title}</h1><p className="lede mt-6">{copy}</p>{paid&&data.kind==='sponsorship'&&<Link className="btn-primary mt-8" href={'/sponsor/'+token}>Sponsoringbericht öffnen</Link>}<Link className="text-link mt-6" href="/contact">Kontakt aufnehmen →</Link></main>
}
