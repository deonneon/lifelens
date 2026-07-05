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

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">Master Timeline</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
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
                  ? 'bg-accent-primary/25 text-white ring-accent-primary/60'
                  : 'bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10'
              }`}
            >
              <span className={e.kind === 'person' ? 'text-violet-300' : 'text-sky-300'}>
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
                  ? 'bg-white/15 text-white ring-white/40'
                  : 'bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
            </button>
          ))}
          <span className="mx-1 text-slate-600">|</span>
          {ALL_SOURCE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setParam('sourceType', t)}
              className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset transition ${
                sourceTypeFilter === t
                  ? 'bg-white/15 text-white ring-white/40'
                  : 'bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10'
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
          className="w-full max-w-md rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-accent-primary/60"
        />
      </div>

      <div className="mt-8">
        {byYear.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
            No events match these filters — try clearing one, or{' '}
            <a href="/ingest" className="text-sky-400 hover:underline">add a source</a> to fill the gap.
          </p>
        )}
        <div className="relative border-l border-white/10 pl-6">
          {byYear.map(([year, events]) => (
            <section key={year} className="mb-8">
              <div className="relative mb-3">
                <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent-primary shadow-neon" />
                <h2 className="font-mono text-lg font-bold text-white">{year}</h2>
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
