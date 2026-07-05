import { Link } from 'react-router-dom'
import type { UniverseEvent } from '../types'
import { useUniverse } from '../lib/store'
import { STATUS_META, accountsFor, formatDate, statusOf } from '../lib/evidence'
import { EntityChip, StatusBadge } from './badges'

export function EventCard({ event, hideEntityId }: { event: UniverseEvent; hideEntityId?: string }) {
  const { state } = useUniverse()
  const status = statusOf(state, event)
  const accounts = accountsFor(state, event.id)
  const sourceCount = new Set(accounts.map((a) => a.sourceId)).size
  const disputes = accounts.filter((a) => a.stance === 'disputes').length

  return (
    <Link
      to={`/events/${event.id}`}
      className="card card-hover group relative block overflow-hidden p-4 pl-5"
    >
      {/* status rail — evidence state readable before any text */}
      <span
        className={`absolute inset-y-0 left-0 w-[3px] ${STATUS_META[status].dot}`}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11.5px] tracking-tight text-ink-500">
          {formatDate(event.date)}
        </span>
        <StatusBadge status={status} />
        <span className="ml-auto font-mono text-[11px] text-ink-600">
          {sourceCount} src{disputes > 0 && <span className="text-status-bad"> · {disputes} disputing</span>}
        </span>
      </div>
      <h3 className="mt-2 font-display text-[17px] font-semibold leading-snug tracking-tight text-ink-100 transition group-hover:text-ink-50">
        {event.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-400">{event.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {event.participants
          .filter((p) => p.entityId !== hideEntityId)
          .map((p) => {
            const entity = state.entities.find((e) => e.id === p.entityId)
            return entity ? <EntityChip key={p.entityId} entity={entity} /> : null
          })}
      </div>
    </Link>
  )
}
