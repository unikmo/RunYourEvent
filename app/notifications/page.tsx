import NotificationCenter from '@/components/NotificationCenter'
export const metadata={title:"Nachrichten & passende Einsätze",robots:{index:false,follow:false}}
export default function Page(){return <main className="shell max-w-4xl section-pad"><p className="eyebrow">Deine Neuigkeiten</p><h2 className="page-title mt-5">Alles Wichtige für deinen nächsten Einsatz.</h2><NotificationCenter/></main>}
