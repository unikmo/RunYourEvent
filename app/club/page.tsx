import WorkspaceRefresh from '@/components/WorkspaceRefresh'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ClubWorkspace from '@/components/ClubWorkspace'

export const dynamic='force-dynamic'
export const metadata:Metadata={title:"Dein Vereinsbereich | RunYourEvent",robots:{index:false,follow:false}}

export default async function ClubPage() {
  const token=(await cookies()).get('rye_club_access')?.value||''
  if(!/^[a-f0-9]{48}$/.test(token))return <main className="shell py-20"><p className="eyebrow">Dein Vereinsbereich</p><h1 className="premium-section mt-5 max-w-3xl">Planen. Ausschreiben.<br/>Gemeinsam anpacken.</h1><p className="lede mt-6">Reiche den ersten Saisonbedarf deines Vereins ein. Damit erstellst du deinen Vereinsbereich auf diesem Gerät. Anschließend kannst du Einsätze veröffentlichen, Freiwillige einladen, Nachrichten schreiben und geleistete Stunden bestätigen.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/seasonal-needs" className="btn-primary">Ersten Vereinsbedarf einreichen</Link><Link href="/access?role=club" className="btn-secondary">Bestehenden Vereinsbereich öffnen</Link></div></main>
  try {
    const {data,error}=await createServerClient().rpc('rye_club_workspace',{p_token:token})
    if(error||!data)return <main className="shell py-20"><h1 className="text-3xl font-black">Dein Vereinsbereich konnte nicht geladen werden.</h1><p className="lede mt-5">Bitte versuch es erneut. Ist deine Anmeldung abgelaufen, melde dich mit der E-Mail-Adresse deiner Registrierung an.</p><Link href="/access?role=club" className="btn-primary mt-6">Bei deinem Vereinsbereich anmelden</Link></main>
    return <main className="bg-[#f7f5ef]"><section className="shell py-16"><p className="eyebrow">Dein Vereinsbereich</p><h1 className="premium-section mt-5 max-w-4xl">Deine Aufgaben. Dein Team.<br/>Alles im Blick.</h1><p className="lede mt-6">Schreibe sichere Einsätze mit klaren Aufgaben aus, lade passende Freiwillige ein und sprich dich direkt mit ihnen ab. Prüfe die geleistete Zeit, bevor sie für Anerkennungen zählt.</p><WorkspaceRefresh/><div className="mt-6 flex flex-wrap gap-3"><Link className="btn-secondary" href="/notifications">Neuigkeiten &amp; Nachrichten</Link><Link className="btn-secondary" href="/billing">Abrechnung &amp; Rechnungen</Link></div><ClubWorkspace workspace={data} /></section></main>
  }catch{return <main className="shell py-20"><h1 className="text-3xl font-black">Dein Vereinsbereich ist gerade nicht erreichbar.</h1><p className="lede mt-5">Wir konnten deinen Vereinsbedarf nicht laden. Bitte versuch es später noch einmal, bevor du eine weitere Anfrage einreichst.</p></main>}
}
