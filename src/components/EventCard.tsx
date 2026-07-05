import { Link } from 'react-router-dom'
import type { UniverseEvent } from '../types'
import { useUniverse } from '../lib/store'
import { accountsFor, formatDate, sourceMap, statusOf } from '../lib/evidence'
import { EntityChip, StatusBadge } from './badges'

export function EventCard({ event, hideEntityId }: { event: UniverseEvent; hideEntityId?: string }) {
  const { state } = useUniverse()
  const status = statusOf(state, event)
  const accounts = accountsFor(state, event.id)
  const srcById = sourceMap(state)
  const sourceCount = new Set(accounts.map((a) => a.sourceId)).size
  const disputes = accounts.filter((a) => a.stance === 'disputes').length

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-slate-400">{formatDate(event.date)}</span>
        <StatusBadge status={status} />
        <span className="ml-auto text-[11px] text-slate-500">
          {sourceCount} source{sourceCount === 1 ? '' : 's'}
          {disputes > 0 && <span className="text-rose-400"> · {disputes} disputing</span>}
        </span>
      </div>
      <h3 className="mt-1.5 font-serif text-base font-semibold text-slate-100 group-hover:text-white">
        {event.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-400">{event.summary}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {event.participants
          .filter((p) => p.entityId !== hideEntityId)
          .map((p) => {
            const entity = state.entities.find((e) => e.id === p.entityId)
            return entity ? <EntityChip key={p.entityId} entity={entity} /> : null
          })}
        {accounts.slice(0, 1).map((a) => {
          const s = srcById.get(a.sourceId)
          return s ? (
            <span key={a.id} className="hidden text-[11px] italic text-slate-500 sm:inline">
              e.g. {s.title.length > 48 ? `${s.title.slice(0, 45)}…` : s.title}
            </span>
          ) : null
        })}
      </div>
    </Link>
  )
}
