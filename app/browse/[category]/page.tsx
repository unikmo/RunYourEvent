'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ChevronRight, Layers3 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'

const SCALE_RANGE: Record<string, string> = {
  Intimate: '15–50 people',
  Medium: '50–500 people',
  Large: '500–5,000 people',
  Mega: '5,000+ people',
}

export default function CategoryPage() {
  const params = useParams<{ category: string }>()
  const category = decodeURIComponent(params.category || '')

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category) return

    setLoading(true)
    supabase
      .from('events')
      .select('*')
      .eq('category', category)
      .eq('has_tasks', true)
      .order('name')
      .then(({ data }) => {
        setEvents((data || []) as Event[])
        setLoading(false)
      })
  }, [category])

  return (
    <main className="bg-[#fbfaf7]">
      <section className="border-b border-black/[0.055] bg-[#f5f2ea]">
        <div className="shell py-14 sm:py-8">
          <nav className="mb-7 flex items-center gap-2 text-xs font-bold text-[#8992a0]" aria-label="Breadcrumb">
            <a href="/browse" className="transition-colors hover:text-[#15233f]">Event library</a>
            <ChevronRight size={13} />
            <span className="text-[#80631f]">{category}</span>
          </nav>

          <p className="eyebrow">Event planning reference category</p>
          <h2 className="page-title mt-4 max-w-4xl">
            {category}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6d7889]">
            Use these event references to understand scope and coverage. For a real event,
            RunYourEvent can adapt the model to your fixed date, scale, format, venue status and objectives.
          </p>

          <a href="/custom" className="btn-primary mt-7">
            Build a tailored execution plan <ArrowRight className="ml-2" size={15} />
          </a>
        </div>
      </section>

      <section className="shell py-12 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black text-[#23324a]">Reference event types</p>
            {!loading && (
              <p className="mt-1 text-xs text-[#8a93a2]">
                {events.length} {events.length === 1 ? 'event model' : 'event models'} currently available
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-black/[0.04] bg-white" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.055] bg-white p-10 text-center">
            <p className="text-lg font-black text-[#23324a]">No reference model is ready in this category yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7a8595]">
              You do not need to wait for the library. Describe the event and build a tailored execution plan instead.
            </p>
            <a href="/custom" className="btn-primary mt-6">Build my plan →</a>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map(event => (
              <a
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-2xl border border-black/[0.055] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#c8aa5b] hover:shadow-xl hover:shadow-black/[0.035]"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2e7c7] text-[#80631f]">
                    <Layers3 size={17} />
                  </span>
                  <span className="rounded-full bg-[#f5f2ea] px-2.5 py-1 text-[10px] font-black text-[#7b8492]">
                    {event.scale}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black tracking-[-0.025em] text-[#23324a] group-hover:text-[#80631f]">
                  {event.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#707b8c]">
                  {event.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-[#f8f6f0] p-3">
                    <p className="font-bold text-[#949ca8]">Typical scale</p>
                    <p className="mt-1 font-black text-[#4f5c70]">{SCALE_RANGE[event.scale] || event.scale}</p>
                  </div>
                  <div className="rounded-xl bg-[#f8f6f0] p-3">
                    <p className="font-bold text-[#949ca8]">Planning horizon</p>
                    <p className="mt-1 font-black text-[#4f5c70]">
                      {event.planning_weeks === 0 ? 'Flexible' : `${event.planning_weeks} weeks`}
                    </p>
                  </div>
                </div>

                <span className="mt-5 inline-flex items-center text-sm font-black text-[#9a7b31]">
                  View reference plan <ArrowRight className="ml-2" size={14} />
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-[#15233f] p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#efcd6d]">Do not plan from a generic template</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">
              Use the library to understand scope. Use RunYourEvent to plan the actual event.
            </h3>
          </div>
          <a href="/custom" className="btn-signal mt-6 shrink-0 sm:mt-0">
            Build my plan →
          </a>
        </div>
      </section>
    </main>
  )
}
