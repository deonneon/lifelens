import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { EventStatus, SourceType } from '../types'
import { useUniverse } from '../lib/store'
import {
  SOURCE_TYPE_META,
  STATUS_META,
  accountsFor,
  sourceMap,
  statusOf,
  yearOf,
} from '../lib/evidence'
import { EventCard } from '../components/EventCard'

const ALL_STATUSES = Object.keys(STATUS_META) as EventStatus[]
const ALL_SOURCE_TYPES = Object.keys(SOURCE_TYPE_META) as SourceType[]

export function TimelinePage() {
  const { state } = useUniverse()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')

  const entityFilter = params.get('entity')
  const statusFilter = params.get('status') as EventStatus | null
  const sourceTypeFilter = params.get('sourceType') as SourceType | null

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || params.get(key) === value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const srcById = sourceMap(state)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.events
      .filter((ev) => {
        if (entityFilter && !ev.participants.some((p) => p.entityId === entityFilter)) return false
        if (statusFilter && statusOf(state, ev) !== statusFilter) return false
        if (sourceTypeFilter) {
          const types = accountsFor(state, ev.id).map((a) => srcById.get(a.sourceId)?.type)
          if (!types.includes(sourceTypeFilter)) return false
        }
        if (q) {
          const hay = `${ev.title} ${ev.summary} ${ev.tags.join(' ')}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [state, entityFilter, statusFilter, sourceTypeFilter, query, srcById])

  const byYear = useMemo(() => {
    const groups = new Map<string, typeof filtered>()
    for (const ev of filtered) {
      const y = yearOf(ev.date)
      const arr = groups.get(y) ?? []
      arr.push(ev)
      groups.set(y, arr)
    }
    return [...groups.entries()]
  }, [filtered])

  // density strip: per-year counts stacked by status, in fixed stack order
  const STACK: EventStatus[] = ['corroborated', 'single-source', 'disputed', 'rumor']
  const density = useMemo(
    () =>
      byYear.map(([year, events]) => {
        const counts = { corroborated: 0, 'single-source': 0, disputed: 0, rumor: 0 }
        for (const ev of events) counts[statusOf(state, ev)] += 1
        return { year, total: events.length, counts }
      }),
    [byYear, state],
  )
  const maxYear = Math.max(1, ...density.map((d) => d.total))

  return (
    <div>
      <div className="eyebrow">Chronology</div>
      <h1 className="page-title">Master Timeline</h1>
      <p className="lede">
        Pinpoint any activity by any character: filter by character, evidence status, or the kind of
        source backing it. Chronological, additive, and every card traceable.
      </p>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {state.entities.map((e) => (
            <button
              key={e.id}
              onClick={() => setParam('entity', e.id)}
              className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset transition ${
                entityFilter === e.id
                  ? 'bg-accent/25 text-ink-50 ring-accent/60'
                  : 'bg-surface-2 text-ink-300 ring-edge hover:bg-surface-3'
              }`}
            >
              <span className={e.kind === 'person' ? 'text-accent-bright' : 'text-status-info'}>
                {e.kind === 'person' ? '●' : '■'}
              </span>{' '}
              {e.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ring-1 ring-inset transition ${
                statusFilter === s
                  ? 'bg-surface-3 text-ink-50 ring-edge-bright'
                  : 'bg-surface-2 text-ink-300 ring-edge hover:bg-surface-3'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
            </button>
          ))}
          <span className="mx-1 text-ink-600">|</span>
          {ALL_SOURCE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setParam('sourceType', t)}
              className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset transition ${
                sourceTypeFilter === t
                  ? 'bg-surface-3 text-ink-50 ring-edge-bright'
                  : 'bg-surface-2 text-ink-400 ring-edge hover:bg-surface-3'
              }`}
            >
              {SOURCE_TYPE_META[t].label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, summaries, tags…"
          className="w-full max-w-md rounded-full border border-edge bg-surface-2 px-4 py-1.5 text-sm text-ink-100 placeholder-ink-600 outline-none transition focus:border-accent/60"
        />
      </div>

      {density.length > 0 && (
        <div className="card mt-6 px-5 pb-3 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow !tracking-[0.12em]">Activity by year</span>
            <span className="text-[11px] text-ink-600">stacked by evidence status · click to jump</span>
          </div>
          <div className="mt-3 flex items-end gap-[3px] overflow-x-auto pb-1">
            {density.map((d) => (
              <button
                key={d.year}
                onClick={() =>
                  document.getElementById(`year-${d.year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                title={`${d.year} — ${d.total} event${d.total === 1 ? '' : 's'}: ${STACK.filter((s) => d.counts[s] > 0)
                  .map((s) => `${d.counts[s]} ${STATUS_META[s].label.toLowerCase()}`)
                  .join(', ')}`}
                className="group flex min-w-[30px] flex-1 flex-col items-center gap-1.5"
              >
                <span className="flex h-[56px] w-full max-w-[38px] flex-col-reverse gap-[2px]">
                  {STACK.map((s) =>
                    d.counts[s] > 0 ? (
                      <span
                        key={s}
                        className={`w-full rounded-[2px] ${STATUS_META[s].dot} opacity-80 transition group-hover:opacity-100`}
                        style={{ height: `${Math.max(6, (d.counts[s] / maxYear) * 56)}px` }}
                      />
                    ) : null,
                  )}
                </span>
                <span className="font-mono text-[10px] text-ink-500 transition group-hover:text-ink-100">
                  {d.year.slice(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {byYear.length === 0 && (
          <p className="card p-8 text-center text-sm text-ink-400">
            No events match these filters — try clearing one, or{' '}
            <a href="/ingest" className="text-accent-bright hover:underline">add a source</a> to fill the gap.
          </p>
        )}
        <div className="relative border-l border-edge pl-6">
          {byYear.map(([year, events]) => (
            <section key={year} id={`year-${year}`} className="mb-8 scroll-mt-24">
              <div className="relative mb-3">
                <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
                <h2 className="font-mono text-lg font-bold text-ink-50">{year}</h2>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
