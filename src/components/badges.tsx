import { Link } from 'react-router-dom'
import type { Entity, EventStatus, Source, Stance } from '../types'
import { SOURCE_TYPE_META, STANCE_META, STATUS_META, TIER_LABELS, sourceTier } from '../lib/evidence'

const badgeBase =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap'

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
    1: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    2: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
    3: 'bg-violet-500/15 text-violet-300 ring-violet-400/30',
    4: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  }
  return (
    <span className={`${badgeBase} ${colors[tier]}`} title={SOURCE_TYPE_META[source.type].blurb}>
      {TIER_LABELS[tier]}
    </span>
  )
}

export function SourceTypeBadge({ source }: { source: Source }) {
  return (
    <span className={`${badgeBase} bg-white/5 text-slate-300 ring-white/10`}>
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
  const color = entity.kind === 'person' ? 'text-violet-300' : 'text-sky-300'
  return (
    <Link
      to={`/characters/${entity.id}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/10 hover:ring-white/25"
      title={role ? `${entity.name} — ${role}` : entity.name}
    >
      <span className={`text-[9px] ${color}`}>{icon}</span>
      {entity.name}
      {role && <span className="text-slate-400">· {role}</span>}
    </Link>
  )
}
