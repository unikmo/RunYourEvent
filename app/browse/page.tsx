'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CalendarRange, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function BrowsePage() {
  const [categories, setCategories] = useState<{ name: string; event_count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('category')
      .then(({ data }) => {
        const counts: Record<string, number> = {}
        ;(data || []).forEach((row: { category: string }) => {
          if (row.category) counts[row.category] = (counts[row.category] || 0) + 1
        })

        setCategories(
          Object.entries(counts)
            .map(([name, event_count]) => ({ name, event_count }))
            .sort((a, b) => b.event_count - a.event_count || a.name.localeCompare(b.name))
        )
        setLoading(false)
      })
  }, [])

  return (
    <main className="bg-[#fbfaf7]">
      <section className="border-b border-black/[0.055] bg-[#f5f2ea]">
        <div className="shell grid items-end gap-8 py-8 lg:grid-cols-[1fr_auto] lg:py-10">
          <div className="max-w-3xl">
            <p className="eyebrow">Event execution template library</p>
            <h2 className="page-title mt-4">
              Start from execution knowledge.
              <span className="block text-[#8b7440]">Then tailor the operating plan.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6d7889]">
              Browse event types for coverage and inspiration. When you are ready to execute,
              RunYourEvent adapts the event context into a dependency-aware execution model.
            </p>
          </div>
          <a href="/custom" className="btn-primary">
            Build a tailored plan <ArrowRight className="ml-2" size={15} />
          </a>
        </div>
      </section>

      <section className="shell py-14 sm:py-8">
        <div className="mb-7 flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black text-[#23324a]">Browse by category</p>
            <p className="mt-1 text-xs text-[#8b94a2]">Structured reference models available in RunYourEvent.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-black/[0.055] bg-white px-3 py-2 text-xs font-bold text-[#7b8594] sm:flex">
            <Search size={13} /> Choose a category
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-black/[0.04] bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(cat => (
              <a
                key={cat.name}
                href={`/browse/${encodeURIComponent(cat.name)}`}
                className="group rounded-2xl border border-black/[0.055] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#c8aa5b] hover:shadow-xl hover:shadow-black/[0.035]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3ead2] text-[#8b6b23]">
                    <CalendarRange size={17} />
                  </span>
                  <span className="text-xs font-black text-[#a0a7b1]">{cat.event_count} types</span>
                </div>
                <h3 className="mt-5 text-lg font-black tracking-[-0.025em] text-[#23324a] group-hover:text-[#80631f]">
                  {cat.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#7a8595]">
                  Explore event references, then generate a plan from your own fixed date and operating context.
                </p>
                <span className="mt-5 inline-flex items-center text-sm font-black text-[#9a7b31]">
                  Explore category <ArrowRight className="ml-2" size={14} />
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-[#15233f] p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#efcd6d]">Your event is more specific?</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">Describe it instead of searching for a perfect template.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              RunYourEvent can use a reference model where available and adapt it to the objective, scale, format, venue status and fixed date.
            </p>
          </div>
          <a href="/custom" className="btn-signal mt-6 shrink-0 sm:mt-0">Build my plan →</a>
        </div>
      </section>
    </main>
  )
}
