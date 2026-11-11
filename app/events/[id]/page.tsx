'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Layers3,
  Printer,
  Users,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Event, Task, Layer } from '@/types'

const LAYERS: Layer[] = ['Promotion', 'Setup', 'Execution', 'Cleanup']

const SCALE_RANGE: Record<string, string> = {
  Intimate: '15–50 people',
  Medium: '50–500 people',
  Large: '500–5,000 people',
  Mega: '5,000+ people',
}

export default function EventPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [event, setEvent] = useState<Event | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (!eventData) {
        setEvent(null)
        setTasks([])
        setLoading(false)
        return
      }

      setEvent(eventData as Event)

      if (eventData.has_tasks) {
        const { data: taskData } = await supabase
          .from('tasks')
          .select('*')
          .eq('event_id', id)
          .order('slot')

        setTasks((taskData || []) as Task[])
      } else {
        setTasks([])
      }

      setLoading(false)
    }

    load()
  }, [id])

  const tasksByLayer = useMemo(() => {
    return LAYERS.reduce((acc, layer) => {
      acc[layer] = tasks.filter(task => task.layer === layer)
      return acc
    }, {} as Record<Layer, Task[]>)
  }, [tasks])

  const totalMinutes = useMemo(
    () => tasks.reduce((sum, task) => sum + task.time_minutes, 0),
    [tasks]
  )

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  if (loading) {
    return (
      <main className="grid min-h-[62vh] place-items-center bg-[#fbfaf7]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#e8e4da] border-t-[#9d7c2f]" />
          <p className="mt-4 text-sm font-bold text-[#8b94a2]">Loading reference plan…</p>
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="grid min-h-[62vh] place-items-center bg-[#fbfaf7] px-6 text-center">
        <div>
          <p className="eyebrow">Reference not found</p>
          <h1 className="page-title mt-3 text-[#15233f]">This event model is unavailable.</h1>
          <a href="/custom" className="btn-primary mt-6">Build a tailored plan instead →</a>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#fbfaf7]">
      <section className="border-b border-black/[0.055] bg-[#f5f2ea]">
        <div className="shell py-12 sm:py-8">
          <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8992a0]" aria-label="Breadcrumb">
            <a href="/browse" className="hover:text-[#15233f]">Event library</a>
            <ChevronRight size={13} />
            <a
              href={`/browse/${encodeURIComponent(event.category)}`}
              className="hover:text-[#15233f]"
            >
              {event.category}
            </a>
            <ChevronRight size={13} />
            <span className="text-[#80631f]">{event.name}</span>
          </nav>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-4xl">
              <p className="eyebrow">Event planning reference model</p>
              <h1 className="page-title mt-4">{event.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#687386]">{event.description}</p>
            </div>

            <a href="/custom" className="btn-primary">
              Tailor this to my event <ArrowRight className="ml-2" size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="shell py-10 sm:py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [Users, 'Typical scale', SCALE_RANGE[event.scale] || event.scale],
            [CalendarDays, 'Plan ahead', event.planning_weeks === 0 ? 'Flexible' : `${event.planning_weeks} weeks`],
            [Layers3, 'Complexity', `${event.complexity}/5`],
            [CheckCircle2, 'Reference tasks', String(tasks.length)],
            [Clock3, 'Task effort', `${totalHours}h`],
          ].map(([Icon, label, value]: any) => (
            <div key={label} className="metric">
              <Icon size={16} className="text-[#9a7b31]" />
              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.1em] text-[#9ba2ad]">{label}</p>
              <p className="mt-1 text-sm font-black text-[#435066]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#ded2aa] bg-[#fbf6e7] p-5">
          <p className="text-sm font-black text-[#5f4b1f]">This is a reference plan, not your final execution plan.</p>
          <p className="mt-1.5 max-w-4xl text-xs leading-5 text-[#8b7440]">
            It does not know your fixed date, venue status, attendance assumptions or objectives. Use it to understand scope, then generate a tailored dependency-aware plan for the actual event.
          </p>
        </div>

        {tasks.length > 0 ? (
          <div className="mt-6 space-y-9">
            {LAYERS.map(layer => {
              const layerTasks = tasksByLayer[layer] || []
              if (!layerTasks.length) return null

              return (
                <section key={layer}>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#9a7b31]">{layer}</p>
                      <h3 className="mt-1 text-xl font-black tracking-[-0.025em] text-[#23324a]">
                        {layerTasks.length} reference tasks
                      </h3>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-black/[0.055] bg-white">
                    <div className="hidden grid-cols-[50px_1fr_150px_80px] gap-3 border-b border-black/[0.055] bg-[#f8f6f0] px-5 py-3 text-[9px] font-black uppercase tracking-[0.1em] text-[#9ba2ad] md:grid">
                      <div>#</div>
                      <div>Task</div>
                      <div>Owner</div>
                      <div className="text-right">Effort</div>
                    </div>

                    <div className="divide-y divide-black/[0.055]">
                      {layerTasks.map((task, index) => (
                        <article
                          key={task.id}
                          className="grid gap-3 px-5 py-4 md:grid-cols-[50px_1fr_150px_80px]"
                        >
                          <div className="text-[10px] font-black text-[#acb2bb]">
                            {String(task.slot ?? index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#26344c]">{task.title}</p>
                            <p className="mt-1 text-xs leading-5 text-[#858f9e]">
                              {task.definition_of_done}
                            </p>
                          </div>
                          <div className="text-xs font-bold text-[#697587]">{task.who}</div>
                          <div className="text-xs font-black text-[#80631f] md:text-right">{task.time_minutes} min</div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })}

            <div className="flex flex-col justify-between gap-5 rounded-2xl bg-[#15233f] p-7 text-white sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#efcd6d]">Ready to make it real?</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">
                  Add your date and context. Turn this reference into an execution plan.
                </h3>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary !border-white/20 !bg-transparent !text-white hover:!bg-white/5"
                >
                  <Printer className="mr-2" size={15} /> Print reference
                </button>
                <a href="/custom" className="btn-signal">Build tailored plan →</a>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-black/[0.055] bg-white p-10 text-center">
            <p className="text-lg font-black text-[#23324a]">No reference tasks are attached to this event yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7a8595]">
              RunYourEvent can still construct a tailored plan from your event brief.
            </p>
            <a href="/custom" className="btn-primary mt-6">Build the execution plan →</a>
          </div>
        )}
      </section>
    </main>
  )
}
