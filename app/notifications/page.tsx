import NotificationCenter from '@/components/NotificationCenter'
export const metadata={title:"Nachrichten & passende Einsätze",robots:{index:false,follow:false}}
export default function Page(){return <main className="shell max-w-4xl section-pad"><p className="eyebrow">Deine Neuigkeiten</p><h1 className="premium-section mt-5">Alles Wichtige für deinen nächsten Einsatz.</h1><NotificationCenter/></main>}
