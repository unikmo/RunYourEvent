'use client'

import { FormEvent, useState } from 'react'

const topics = ['General', 'Clubs and associations', 'Volunteering', 'Sponsorship', 'Team volunteering day', 'My account']

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : '')
      form.reset()
      setStatus('sent')
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Your message could not be sent. Please try again or email hello@runyourevent.com.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="panel p-7" role="status" aria-live="polite">
        <h3 className="font-black text-[#23324a]">Thank you. Your message is with us.</h3>
        <p className="mt-3 text-sm leading-6 text-[#687386]">
          We will reply by email, usually within two working days. If you do not hear from us, check your spam folder or write to{' '}
          <a className="font-black text-[#9a7b31]" href="mailto:hello@runyourevent.com">hello@runyourevent.com</a>.
        </p>
      </div>
    )
  }

  return (
    <form className="panel grid gap-4 p-7" onSubmit={submit} noValidate={false}>
      <label className="grid gap-1 text-sm font-bold text-[#23324a]">Name
        <input name="name" required maxLength={100} autoComplete="name" className="rounded-lg border border-[#d8dde6] px-3 py-2 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-bold text-[#23324a]">Email
        <input name="email" type="email" required maxLength={254} autoComplete="email" className="rounded-lg border border-[#d8dde6] px-3 py-2 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-bold text-[#23324a]">Topic
        <select name="topic" className="rounded-lg border border-[#d8dde6] px-3 py-2 font-normal">
          {topics.map(t => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold text-[#23324a]">Message
        <textarea name="message" required minLength={2} maxLength={5000} rows={6} className="rounded-lg border border-[#d8dde6] px-3 py-2 font-normal" />
      </label>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <p className="text-xs leading-5 text-[#687386]">We use these details only to answer your message.</p>
      {status === 'error' && <p role="alert" className="text-sm font-bold text-[#b42318]">{error}</p>}
      <button type="submit" disabled={status === 'sending'} className="rounded-full bg-[#23324a] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
