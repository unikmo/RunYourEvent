'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { GeneratedTask, Layer } from '@/types'

const LAYERS: Layer[] = ['Promotion', 'Setup', 'Execution', 'Cleanup']

export default function SharePage() {
  const params = useParams<{ code: string }>()
  const code = params.code

  const [blueprint, setBlueprint] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return

    setLoading(true)
    supabase
      .from('blueprints')
      .select('*')
      .eq('share_code', code)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('[share] fetch error:', error)
        setBlueprint(data)
        setLoading(false)
      })
  }, [code])

  const tasks: GeneratedTask[] = blueprint?.tasks || []

  const totalMinutes = useMemo(
    () => tasks.reduce((sum, task) => sum + task.time_minutes, 0),
    [tasks]
  )

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const tasksByLayer = useMemo(() => {
    return LAYERS.reduce((acc, layer) => {
      acc[layer] = tasks.filter(task => task.layer === layer)
      return acc
    }, {} as Record<Layer, GeneratedTask[]>)
  }, [tasks])

  if (loading) {
    return (
      <main className="grid min-h-[62vh] place-items-center bg-[#fbfaf7]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#e8e4da] border-t-[#9d7c2f]" />
          <p className="mt-4 text-sm font-bold text-[#8b94a2]">Loading shared plan…</p>
        </div>
      </main>
    )
  }

  if (!blueprint) {
    return (
      <main className="grid min-h-[62vh] place-items-center bg-[#fbfaf7] px-6 text-center">
        <div>
          <p className="eyebrow">Shared plan unavailable</p>
          <h2 className="page-title mt-3 text-[#15233f]">We could not find this execution plan.</h2>
          <a href="/custom" className="btn-primary mt-6">Build your own plan →</a>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#fbfaf7]">
      <section className="border-b border-black/[0.055] bg-[#f5f2ea]">
        <div className="shell py-12 sm:py-8">
          <p className="eyebrow">Shared RunYourEvent plan</p>
          <h2 className="page-title mt-4">
            {blueprint.event_name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#768192]">
            <span>{tasks.length} tasks</span>
            <span>·</span>
            <span>{totalHours}h estimated effort</span>
            {blueprint.guest_count && (
              <>
                <span>·</span>
                <span>{blueprint.guest_count} attendees</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="shell py-10 sm:py-12">
        <div className="space-y-7">
          {LAYERS.map(layer => {
            const layerTasks = tasksByLayer[layer] || []
            if (!layerTasks.length) return null

            return (
              <section key={layer} className="overflow-hidden rounded-2xl border border-black/[0.055] bg-white">
                <div className="flex items-center justify-between border-b border-black/[0.055] bg-[#f8f6f0] px-5 py-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9a7b31]">{layer}</p>
                    <p className="mt-1 text-sm font-black text-[#26344c]">{layerTasks.length} tasks</p>
                  </div>
                </div>

                <div className="divide-y divide-black/[0.055]">
                  {layerTasks.map((task, index) => (
                    <article key={task.id || index} className="p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#9a7b31]" />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#26344c]">{task.title}</p>
                          <p className="mt-1 text-xs font-bold text-[#778293]">{task.who}</p>
                          <p className="mt-2 text-xs leading-5 text-[#8a93a2]">{task.definition_of_done}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-[#15233f] p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#efcd6d]">Plan another event</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">
              Build the event operating model from your own fixed date.
            </h3>
          </div>
          <a href="/custom" className="btn-signal mt-6 shrink-0 sm:mt-0">
            Build my plan <ArrowRight className="ml-2" size={15} />
          </a>
        </div>
      </section>
    </main>
  )
}
