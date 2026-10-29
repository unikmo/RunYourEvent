import type { Metadata } from 'next'
import AccessForm from '@/components/AccessForm'

export const metadata:Metadata={title:"Melde dich bei deinem Konto an",description:"Öffne deinen geschützten Engagementpass oder Vereinsbereich mit einem Anmeldelink oder Code per E-Mail.",referrer:'no-referrer',robots:{index:false,follow:false},alternates:{canonical:'/access'}}
export default async function AccessPage({searchParams}:{searchParams:Promise<{role?:string}>}) {
  const query=await searchParams
  const role=query.role==='club'?'club':'volunteer'
  return <main className="shell max-w-3xl section-pad"><p className="eyebrow">Dein RunYourEvent-Konto</p><h1 className="premium-section mt-5">Schön, dass du wieder da bist.</h1><p className="lede mt-7">Melde dich auf diesem Gerät bei deinem Engagementpass oder Vereinsbereich an. Dafür bestätigen wir die E-Mail-Adresse, die du bei der Registrierung angegeben hast.</p><AccessForm initialRole={role}/></main>
}
