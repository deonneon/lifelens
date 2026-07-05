import { Link } from 'react-router-dom'
import type { Entity, EventStatus, Source, Stance } from '../types'
import { SOURCE_TYPE_META, STANCE_META, STATUS_META, TIER_LABELS, sourceTier } from '../lib/evidence'

const badgeBase =
  'inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px] font-medium ring-1 ring-inset whitespace-nowrap'

export function StatusBadge({ status }: { status: EventStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`${badgeBase} ${meta.badge}`} title={meta.blurb}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export function TierBadge({ source }: { source: Source }) {
  const tier = sourceTier(source)
  const colors: Record<number, string> = {
    1: 'bg-status-good/10 text-status-good ring-status-good/30',
    2: 'bg-status-info/10 text-status-info ring-status-info/30',
    3: 'bg-accent/10 text-accent-bright ring-accent/30',
    4: 'bg-status-warn/10 text-status-warn ring-status-warn/30',
  }
  return (
    <span className={`${badgeBase} font-mono ${colors[tier]}`} title={SOURCE_TYPE_META[source.type].blurb}>
      {TIER_LABELS[tier]}
    </span>
  )
}

export function SourceTypeBadge({ source }: { source: Source }) {
  return (
    <span className={`${badgeBase} bg-surface-2 text-ink-400 ring-edge`}>
      {SOURCE_TYPE_META[source.type].label}
    </span>
  )
}

export function StanceBadge({ stance }: { stance: Stance }) {
  const meta = STANCE_META[stance]
  return <span className={`${badgeBase} ${meta.badge}`}>{meta.label}</span>
}

export function EntityChip({ entity, role }: { entity: Entity; role?: string }) {
  const icon = entity.kind === 'person' ? '●' : '■'
  const color = entity.kind === 'person' ? 'text-accent-bright' : 'text-status-info'
  return (
    <Link
      to={`/characters/${entity.id}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-2.5 py-[3px] text-xs font-medium text-ink-300 transition hover:border-edge-bright hover:text-ink-50"
      title={role ? `${entity.name} — ${role}` : entity.name}
    >
      <span className={`text-[8px] ${color}`}>{icon}</span>
      {entity.name}
      {role && <span className="font-normal text-ink-500">· {role}</span>}
    </Link>
  )
}
