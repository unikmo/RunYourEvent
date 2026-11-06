'use client'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
export default function LegacyProductNotice(){
 const path=usePathname()
 if(!['/events/','/share/','/workspace/','/checkout/success'].some(prefix=>path.startsWith(prefix)))return null
 return <aside className="border-b border-[#d5ad48]/40 bg-[#eee7d3] px-5 py-4 text-center text-sm leading-6"><b>Frühere Veranstaltungspläne.</b> Hier findest du frühere Pläne und Käufe. Ihre Preise und geplanten Arbeitsstunden gehören zur früheren Veranstaltungsplanung und zählen nicht als freiwillige Einsatzstunden. <Link className="font-bold underline" href="/">Zu den freiwilligen Einsätzen</Link></aside>
}
