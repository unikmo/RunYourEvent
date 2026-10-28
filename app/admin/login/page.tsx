'use client'
import {userMessage} from '@/lib/user-message'

import { FormEvent, useState } from 'react'

export default function AdminLoginPage() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault();setLoading(true);setError('')
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    const data=await res.json().catch(()=>({}))
    if(!res.ok){setError(userMessage(data.error)||"Die Anmeldung hat nicht geklappt.");setLoading(false);return}
    window.location.href='/admin'
  }

  return <main className="min-h-[70vh] bg-[#fbfaf7]"><section className="shell max-w-lg py-20"><p className="eyebrow">RunYourEvent-Verwaltung</p><h1 className="display mt-4 text-5xl font-black">Zugang zur Verwaltung</h1><p className="mt-4 text-sm leading-6 text-[#687386]">Geschützter Zugang zur Einsatzverwaltung, zum Sponsoring, zur Stundenbestätigung, zu Anerkennungen und Abrechnungsproblemen.</p><form onSubmit={submit} className="panel mt-8 space-y-5 p-7"><div><label className="label">E-Mail</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/></div><div><label className="label">Passwort</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></div>{error&&<p className="text-sm font-bold text-red-700">{error}</p>}<button disabled={loading} className="btn-primary w-full" type="submit">{loading?"Du wirst angemeldet …":"Anmelden"}</button></form></section></main>
}
