'use client'

import { useState } from 'react'
import type { GeneratedTask, Layer } from '@/types'
import { LAYER_COLORS } from '@/types'

interface Props {
  tasks: GeneratedTask[]
  eventDate: string
  planningStart: string
  eventName: string
}

interface TooltipState {
  task: GeneratedTask
  x: number
  y: number
}

export default function GanttView({ tasks, eventDate, planningStart, eventName }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const start = new Date(planningStart)
  const end = new Date(eventDate)
  const totalMs = end.getTime() - start.getTime()
  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24))

  const today = new Date()
  const todayPct =
    today >= start && today <= end
      ? ((today.getTime() - start.getTime()) / totalMs) * 100
      : null

  const eventPct = 100

  // Group tasks by sub_project (fall back to layer)
  const rowMap: Record<string, GeneratedTask[]> = {}
  for (const t of tasks) {
    const key = t.sub_project || t.layer
    if (!rowMap[key]) rowMap[key] = []
    rowMap[key].push(t)
  }

  // Sort rows: sub_projects ordered by earliest task's weeks_before_event desc
  const rows = Object.entries(rowMap).sort(([, a], [, b]) => {
    const maxA = Math.max(...a.map(t => t.weeks_before_event ?? 0))
    const maxB = Math.max(...b.map(t => t.weeks_before_event ?? 0))
    return maxB - maxA
  })

  // Month markers
  const months: { label: string; pct: number }[] = []
  const cur = new Date(start)
  cur.setDate(1)
  cur.setMonth(cur.getMonth() + 1)
  while (cur < end) {
    const pct = ((cur.getTime() - start.getTime()) / totalMs) * 100
    months.push({
      label: cur.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
      pct,
    })
    cur.setMonth(cur.getMonth() + 1)
  }

  function dotPct(task: GeneratedTask): number | null {
    if (!task.target_date) return null
    const td = new Date(task.target_date)
    const pct = ((td.getTime() - start.getTime()) / totalMs) * 100
    return Math.max(0, Math.min(100, pct))
  }

  // Layer summary counts
  const layers: Layer[] = ['Promotion', 'Setup', 'Execution', 'Cleanup']
  const layerCounts = layers.map(l => ({
    layer: l,
    count: tasks.filter(t => t.layer === l).length,
    colors: LAYER_COLORS[l],
  }))

  const weekCount = Math.round(totalDays / 7)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-navy text-white rounded-2xl p-5">
        <h3 className="text-lg font-bold">{eventName}</h3>
        <p className="text-white/60 text-sm mt-0.5">
          {new Date(planningStart).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' → '}
          {new Date(eventDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}{weekCount} weeks
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3">
          {layers.map(l => (
            <div key={l} className="flex items-center gap-1.5 text-xs text-white/80">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: LAYER_COLORS[l].dot }}
              />
              {l}
            </div>
          ))}
          {todayPct !== null && (
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="inline-block w-0.5 h-3 bg-red-400 flex-shrink-0" />
              Today
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <span className="inline-block w-0.5 h-3 bg-yellow-400 flex-shrink-0" />
            Event day
          </div>
        </div>
      </div>

      {/* Gantt chart */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Month axis */}
        <div className="relative h-7 border-b border-gray-100 bg-gray-50">
          {months.map(m => (
            <span
              key={m.label}
              className="absolute top-1 text-xs text-gray-400 -translate-x-1/2"
              style={{ left: `${m.pct}%` }}
            >
              {m.label}
            </span>
          ))}
          {/* Event date marker in axis */}
          <div
            className="absolute top-0 bottom-0 w-px bg-yellow-400"
            style={{ left: '100%' }}
          />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {rows.map(([rowName, rowTasks]) => {
            const dotsWithPct = rowTasks
              .map(t => ({ task: t, pct: dotPct(t) }))
              .filter(d => d.pct !== null) as { task: GeneratedTask; pct: number }[]

            const pcts = dotsWithPct.map(d => d.pct)
            const minPct = pcts.length ? Math.min(...pcts) : null
            const maxPct = pcts.length ? Math.max(...pcts) : null

            return (
              <div key={rowName} className="flex items-center relative group">
                {/* Row label */}
                <div className="w-36 flex-shrink-0 px-4 py-3 text-xs font-semibold text-gray-600 truncate border-r border-gray-100 bg-gray-50/50">
                  {rowName}
                </div>

                {/* Timeline area */}
                <div className="flex-1 relative h-12">
                  {/* Connector line between first and last dot */}
                  {minPct !== null && maxPct !== null && minPct !== maxPct && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-px bg-gray-200"
                      style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
                    />
                  )}

                  {/* Today marker */}
                  {todayPct !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400/60"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}

                  {/* Event date line */}
                  <div className="absolute top-0 bottom-0 w-px bg-yellow-400/80" style={{ left: '100%' }} />

                  {/* Task dots */}
                  {dotsWithPct.map(({ task, pct }, i) => {
                    const color = LAYER_COLORS[task.layer]?.dot ?? '#6b7280'
                    return (
                      <button
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform z-10"
                        style={{ left: `${pct}%`, backgroundColor: color }}
                        onMouseEnter={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          setTooltip({ task, x: rect.left, y: rect.top })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip (portal-less, fixed) */}
      {tooltip && (
        <div
          className="fixed z-50 bg-navy text-white text-xs rounded-xl shadow-xl p-3 max-w-[220px] pointer-events-none"
          style={{ top: tooltip.y - 10, left: tooltip.x + 20, transform: 'translateY(-100%)' }}
        >
          <p className="font-bold mb-1 leading-snug">{tooltip.task.title}</p>
          <p className="text-white/60">{tooltip.task.who}</p>
          <p className="text-white/60">{tooltip.task.time_minutes} min</p>
          {tooltip.task.target_date && (
            <p className="text-yellow-300 mt-1">
              {new Date(tooltip.task.target_date).toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
          {tooltip.task.weeks_before_event != null && (
            <p className="text-white/50 text-[10px]">
              {tooltip.task.weeks_before_event === 0
                ? 'Event day'
                : `${tooltip.task.weeks_before_event}w before`}
            </p>
          )}
        </div>
      )}

      {/* Layer summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {layerCounts.map(({ layer, count, colors }) => (
          <div
            key={layer}
            className={`rounded-xl p-3 text-center border ${colors.bg} ${colors.border}`}
          >
            <div className={`text-2xl font-bold ${colors.text}`}>{count}</div>
            <div className={`text-xs font-medium mt-0.5 ${colors.text} opacity-70`}>{layer}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
