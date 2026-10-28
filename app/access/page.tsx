import type { Metadata } from 'next'
import AccessForm from '@/components/AccessForm'

export const metadata:Metadata={title:'Sign in to your account',description:'Open your private RunYourEvent volunteer passport or club workspace with an email sign-in link or code.',referrer:'no-referrer',robots:{index:false,follow:false},alternates:{canonical:'/access'}}
export default async function AccessPage({searchParams}:{searchParams:Promise<{role?:string}>}) {
  const query=await searchParams
  const role=query.role==='club'?'club':'volunteer'
  return <main className="shell max-w-3xl section-pad"><p className="eyebrow">Your RunYourEvent account</p><h1 className="premium-section mt-5">Welcome back.</h1><p className="lede mt-7">Open your volunteer passport or club workspace on this device. We’ll verify the email attached to your existing record.</p><AccessForm initialRole={role}/></main>
}
