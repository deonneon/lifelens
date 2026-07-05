import type {
  Account,
  EventStatus,
  Source,
  SourceType,
  Stance,
  UniverseEvent,
  UniverseState,
} from '../types'

/**
 * Evidence tiers. Lower is stronger. Note that first-hand statements are
 * primary sources but tier 3: the actors in this universe are famously
 * unreliable narrators about themselves.
 */
export const SOURCE_TYPE_META: Record<
  SourceType,
  { label: string; tier: 1 | 2 | 3 | 4; blurb: string }
> = {
  'official-record': {
    label: 'Official record',
    tier: 1,
    blurb: 'Court filings, SEC documents, incorporation papers, government awards',
  },
  reporting: {
    label: 'Reporting',
    tier: 2,
    blurb: 'Reputable journalism with editorial standards',
  },
  biography: {
    label: 'Biography',
    tier: 2,
    blurb: 'Researched secondary accounts (Vance, Isaacson…)',
  },
  analysis: {
    label: 'Analysis',
    tier: 3,
    blurb: 'Commentary, research notes, informed opinion',
  },
  autobiography: {
    label: 'Autobiography',
    tier: 3,
    blurb: 'The subject telling their own story — primary but self-interested',
  },
  'first-hand': {
    label: 'First-hand',
    tier: 3,
    blurb: 'Statements by the actors themselves: tweets, blog posts, press releases',
  },
  rumor: {
    label: 'Rumor',
    tier: 4,
    blurb: 'Unverified claims, speculation, anonymous sourcing',
  },
}

export const TIER_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'T1 · Record',
  2: 'T2 · Researched',
  3: 'T3 · Self-reported',
  4: 'T4 · Unverified',
}

export const STATUS_META: Record<
  EventStatus,
  { label: string; dot: string; badge: string; blurb: string }
> = {
  corroborated: {
    label: 'Corroborated',
    dot: 'bg-status-good',
    badge: 'bg-status-good/10 text-status-good ring-status-good/30',
    blurb: 'Backed by an official record, or by at least two independent non-rumor sources',
  },
  'single-source': {
    label: 'Single source',
    dot: 'bg-status-info',
    badge: 'bg-status-info/10 text-status-info ring-status-info/30',
    blurb: 'Only one non-rumor source so far — more accounts welcome',
  },
  disputed: {
    label: 'Disputed',
    dot: 'bg-status-bad',
    badge: 'bg-status-bad/10 text-status-bad ring-status-bad/30',
    blurb: 'At least one account challenges this event as described',
  },
  rumor: {
    label: 'Rumor',
    dot: 'bg-status-warn',
    badge: 'bg-status-warn/10 text-status-warn ring-status-warn/30',
    blurb: 'Supported only by unverified sources',
  },
}

export const STANCE_META: Record<Stance, { label: string; badge: string }> = {
  supports: { label: 'Supports', badge: 'bg-status-good/10 text-status-good ring-status-good/30' },
  disputes: { label: 'Disputes', badge: 'bg-status-bad/10 text-status-bad ring-status-bad/30' },
  clarifies: { label: 'Clarifies', badge: 'bg-accent/10 text-accent-bright ring-accent/30' },
}

export function sourceTier(source: Source): 1 | 2 | 3 | 4 {
  return SOURCE_TYPE_META[source.type].tier
}

/** Derive an event's truth-status from the accounts attached to it. */
export function deriveStatus(accounts: Account[], sourceById: Map<string, Source>): EventStatus {
  if (accounts.some((a) => a.stance === 'disputes')) return 'disputed'
  const supporting = accounts.filter((a) => a.stance !== 'disputes')
  const tiers = supporting.map((a) => {
    const src = sourceById.get(a.sourceId)
    return src ? sourceTier(src) : 4
  })
  if (tiers.length === 0) return 'rumor'
  if (tiers.every((t) => t === 4)) return 'rumor'
  const solidSources = new Set(
    supporting.filter((a) => {
      const src = sourceById.get(a.sourceId)
      return src && sourceTier(src) < 4
    }).map((a) => a.sourceId),
  )
  if (tiers.includes(1) || solidSources.size >= 2) return 'corroborated'
  return 'single-source'
}

// ── selectors ────────────────────────────────────────────────────────────

export function sourceMap(state: UniverseState): Map<string, Source> {
  return new Map(state.sources.map((s) => [s.id, s]))
}

export function accountsFor(state: UniverseState, eventId: string): Account[] {
  return state.accounts.filter((a) => a.eventId === eventId)
}

export function statusOf(state: UniverseState, event: UniverseEvent): EventStatus {
  return deriveStatus(accountsFor(state, event.id), sourceMap(state))
}

export function eventsForEntity(state: UniverseState, entityId: string): UniverseEvent[] {
  return state.events
    .filter((e) => e.participants.some((p) => p.entityId === entityId))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function accountsForSource(state: UniverseState, sourceId: string): Account[] {
  return state.accounts.filter((a) => a.sourceId === sourceId)
}

// ── formatting ───────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '1971-06-28' → 'Jun 28, 1971'; '1999-02' → 'Feb 1999'; '1995' → '1995'. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-')
  if (!y) return date
  if (!m) return y
  const month = MONTHS[Number(m) - 1] ?? m
  if (!d) return `${month} ${y}`
  return `${month} ${Number(d)}, ${y}`
}

export function yearOf(date: string): string {
  return date.slice(0, 4)
}

let counter = 0
export function freshId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`
}
