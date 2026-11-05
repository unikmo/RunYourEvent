'use client'

import { FormEvent, useState } from 'react'

export default function AdminLoginPage() {
  const [email,setEmail]=useState('mbanwie@googlemail.com')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault();setLoading(true);setError('')
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    const data=await res.json().catch(()=>({}))
    if(!res.ok){setError(data.error||'Login failed.');setLoading(false);return}
    window.location.href='/admin'
  }

  return <main className="min-h-[70vh] bg-[#fbfaf7]"><section className="shell max-w-lg py-10"><p className="eyebrow">RunYourEvent operations</p><h2 className="page-title mt-4">Admin access</h2><p className="mt-4 text-sm leading-6 text-[#687386]">Owner-only access to activity, conversion, orders and event-segment performance.</p><form onSubmit={submit} className="panel mt-8 space-y-5 p-7"><div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/></div><div><label className="label">Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></div>{error&&<p className="text-sm font-bold text-red-700">{error}</p>}<button disabled={loading} className="btn-primary w-full" type="submit">{loading?'Signing in…':'Sign in'}</button></form></section></main>
}
