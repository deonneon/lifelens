import type { Entity, EventStatus, UniverseEvent, UniverseState } from '../types'
import { accountsFor, sourceMap, sourceTier, statusOf } from './evidence'

/**
 * The Rumor Desk: given a fresh, unverified story, assemble everything the
 * corpus already knows that helps judge it — related events and their
 * evidence status, the named actors' track records on self-reported claims,
 * how past rumors resolved, and what official confirmation would look like.
 * It surfaces context and signals; the judgment stays with the reader.
 */

export interface RelatedEvent {
  event: UniverseEvent
  status: EventStatus
  score: number
  sharedEntityIds: string[]
}

export interface ActorRecord {
  entity: Entity
  /** Events involving this actor that lean on first-hand/self-reported accounts. */
  firsthandEvents: number
  /** …of which this many ended up formally disputed. */
  firsthandDisputed: number
  disputedTitles: string[]
}

export interface RumorBaseRate {
  total: number
  corroborated: number
  disputed: number
  open: number
}

export interface OfficialAnchor {
  eventId: string
  eventTitle: string
  quote: string
  sourceTitle: string
}

export interface RumorAnalysis {
  matched: Entity[]
  related: RelatedEvent[]
  actorRecords: ActorRecord[]
  baseRate: RumorBaseRate
  anchors: OfficialAnchor[]
  checklist: string[]
}

const STOPWORDS = new Set(
  ('the a an and or but of to in on at for with from by about into over after before ' +
    'is are was were be been has have had will would could should may might this that ' +
    'these those it its his her their our your they them he she we you says said say ' +
    'according reportedly sources rumor rumors report reports news story breaking').split(' '),
)

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9$ ]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t)),
  )
}

export function matchEntities(text: string, entities: Entity[]): Entity[] {
  const lower = text.toLowerCase()
  return entities.filter((e) =>
    [e.name, ...e.aliases].some((n) => n && lower.includes(n.toLowerCase())),
  )
}

/** Private companies in this universe — no mandatory SEC disclosure trail. */
const PRIVATE_COMPANY_IDS = new Set(['spacex', 'xai', 'twitter-x'])

function buildChecklist(text: string, matched: Entity[]): string[] {
  const lower = text.toLowerCase()
  const list: string[] = []

  if (/acquir|merger|buyout|takeover|take over|deal to buy|bid for/.test(lower)) {
    list.push(
      'M&A claim — real deals leave a paper trail fast: watch EDGAR for an 8-K, SC 13D or merger agreement within 1–2 trading days.',
    )
  }
  if (/ceo|chairman|resign|step down|steps down|board seat|board shake/.test(lower)) {
    list.push(
      'Leadership claim — officer/director changes at public companies must be disclosed on Form 8-K (Item 5.02). No filing, no confirmation.',
    )
  }
  if (/earnings|profit|revenue|quarter|guidance|deliveries|margin/.test(lower)) {
    list.push(
      'Financials claim — check it against the last 10-Q/10-K and the company IR page before believing derived numbers.',
    )
  }
  if (/ipo|going public|public listing|list shares|spin.?off/.test(lower)) {
    list.push('IPO claim — nothing is real until an S-1 (or F-1) hits EDGAR.')
  }
  if (/private|take.*private|delist|going.?private/.test(lower)) {
    list.push(
      'Going-private claim — requires an SC 13E-3 and financing disclosures; recall “funding secured” for how this fails.',
    )
  }
  if (/sec|investigation|probe|subpoena|lawsuit|sues?|charge/.test(lower)) {
    list.push(
      'Legal claim — check the SEC litigation releases and court dockets directly; enforcement actions are public records.',
    )
  }
  if (matched.some((e) => PRIVATE_COMPANY_IDS.has(e.id))) {
    list.push(
      'Involves a private company (SpaceX / xAI / X) — no mandatory disclosures exist, so resolution depends on company statements or multiple independent outlets. Expect it to stay unverified longer.',
    )
  }
  list.push(
    'Are at least two tier-2 outlets reporting it with distinct sourcing — not just relaying the same wire story or the same anonymous source?',
    'Is there a first-hand statement from the actor? Weigh it against their track record above — first-hand is primary, not proof.',
    'Time-box it: if the claim is material and real, official confirmation usually lands within days. Silence past that window is itself evidence.',
  )
  return list
}

export function analyzeRumor(state: UniverseState, text: string): RumorAnalysis {
  const matched = matchEntities(text, state.entities)
  const matchedIds = new Set(matched.map((e) => e.id))
  const rumorTokens = tokens(text)
  const srcById = sourceMap(state)

  // ── related events, ranked by shared characters + keyword overlap ──────
  const related: RelatedEvent[] = state.events
    .map((event) => {
      const sharedEntityIds = event.participants
        .map((p) => p.entityId)
        .filter((id) => matchedIds.has(id))
      const eventTokens = tokens(`${event.title} ${event.summary} ${event.tags.join(' ')}`)
      let overlap = 0
      for (const t of rumorTokens) if (eventTokens.has(t)) overlap += 1
      const score = sharedEntityIds.length * 3 + overlap
      return { event, status: statusOf(state, event), score, sharedEntityIds }
    })
    .filter((r) => r.sharedEntityIds.length > 0 || r.score >= 2)
    .sort((a, b) => b.score - a.score || b.event.date.localeCompare(a.event.date))
    .slice(0, 8)

  // ── actor track records on self-reported claims ─────────────────────────
  const actorRecords: ActorRecord[] = matched.map((entity) => {
    const involving = state.events.filter((ev) =>
      ev.participants.some((p) => p.entityId === entity.id),
    )
    const firsthand = involving.filter((ev) =>
      accountsFor(state, ev.id).some((a) => {
        const src = srcById.get(a.sourceId)
        return src && (src.type === 'first-hand' || src.type === 'autobiography') && a.stance !== 'disputes'
      }),
    )
    const disputed = firsthand.filter((ev) => statusOf(state, ev) === 'disputed')
    return {
      entity,
      firsthandEvents: firsthand.length,
      firsthandDisputed: disputed.length,
      disputedTitles: disputed.map((ev) => ev.title),
    }
  })

  // ── how tier-4 (rumor) sourced events resolved across the whole corpus ──
  const rumorTouched = state.events.filter((ev) =>
    accountsFor(state, ev.id).some((a) => {
      const src = srcById.get(a.sourceId)
      return src ? sourceTier(src) === 4 : false
    }),
  )
  const baseRate: RumorBaseRate = {
    total: rumorTouched.length,
    corroborated: rumorTouched.filter((ev) => statusOf(state, ev) === 'corroborated').length,
    disputed: rumorTouched.filter((ev) => statusOf(state, ev) === 'disputed').length,
    open: rumorTouched.filter((ev) => {
      const s = statusOf(state, ev)
      return s === 'rumor' || s === 'single-source'
    }).length,
  }

  // ── the strongest context: official-record accounts on related events ───
  const anchors: OfficialAnchor[] = related
    .flatMap((r) =>
      accountsFor(state, r.event.id)
        .filter((a) => {
          const src = srcById.get(a.sourceId)
          return src ? sourceTier(src) === 1 : false
        })
        .map((a) => ({
          eventId: r.event.id,
          eventTitle: r.event.title,
          quote: a.quote,
          sourceTitle: srcById.get(a.sourceId)?.title ?? '',
        })),
    )
    .slice(0, 4)

  return { matched, related, actorRecords, baseRate, anchors, checklist: buildChecklist(text, matched) }
}
