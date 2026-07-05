import type { Decision, Entity, EventStatus, UniverseEvent, UniverseState } from '../types'
import { sourceMap, sourceTier, statusOf } from './evidence'
import { analyzeRumor, matchEntities, tokens } from './judge'

/**
 * The Decision Desk: design and strategy pivots are first-class threads in
 * the ledger. Ask about a choice — "why did Starship switch to stainless
 * steel?" — and this module either pulls the matching dossier (history,
 * options weighed, cited rationale, counterpoints) or, when the ledger can't
 * answer yet, assembles a research brief describing exactly what to go find.
 */

export interface DecisionMatch {
  decision: Decision
  score: number
  overlap: number
}

export interface ResearchBrief {
  matched: Entity[]
  related: { event: UniverseEvent; status: EventStatus }[]
  seek: string[]
}

export type SeekResult =
  | { kind: 'decisions'; matches: DecisionMatch[] }
  | { kind: 'brief'; brief: ResearchBrief }

/**
 * Question scaffolding ("why did…") appears in every thread's question text,
 * so it can never distinguish one decision from another — drop it.
 */
const SCAFFOLDING = new Set(
  'why did how what when who does choice choices decision decisions decide decided'.split(' '),
)

/** Fold trivial plurals so “materials” answers “material”. */
function norm(t: string): string {
  return t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t
}

function normTokens(text: string): Set<string> {
  return new Set([...tokens(text)].map(norm))
}

/** Every word a decision record knows about itself, for keyword matching. */
function decisionTokens(d: Decision): Set<string> {
  const bag = [
    d.title,
    d.question,
    d.from,
    d.to,
    d.domain,
    d.tags.join(' '),
    d.options.map((o) => `${o.label} ${o.note ?? ''}`).join(' '),
    d.rationale.map((r) => r.text).join(' '),
    d.counterpoints.map((c) => c.text).join(' '),
  ].join(' ')
  return normTokens(bag)
}

/**
 * A query counts as answered when it shares at least this many SUBJECT
 * keywords — character names are excluded, since "Musk… Tesla…" alone
 * matches every thread they touch without addressing the question.
 */
const MATCH_FLOOR = 2

/**
 * Answer "what's the story behind this design choice?" from the ledger.
 * Returns matching decision dossiers ranked by keyword + character overlap,
 * or a research brief when nothing in the ledger addresses the question.
 */
export function seekDecision(state: UniverseState, query: string): SeekResult {
  const matched = matchEntities(query, state.entities)
  const queryEntities = new Set(matched.map((e) => e.id))
  // only the names of characters actually present in the query are excluded —
  // excluding every alias token corpus-wide swallows ordinary words
  // ("network" is a token of Zip2's former name)
  const nameTokens = normTokens(matched.flatMap((e) => [e.name, ...e.aliases]).join(' '))
  const subjectTokens = [...normTokens(query)].filter(
    (t) => !nameTokens.has(t) && !SCAFFOLDING.has(t) && !SCAFFOLDING.has(norm(t)),
  )

  const matches: DecisionMatch[] = state.decisions
    .map((decision) => {
      const bag = decisionTokens(decision)
      let overlap = 0
      for (const t of subjectTokens) if (bag.has(t)) overlap += 1
      const shared = decision.participants.filter((p) => queryEntities.has(p.entityId)).length
      return { decision, overlap, score: overlap * 2 + shared }
    })
    .filter((m) => m.overlap >= MATCH_FLOOR)
    .sort((a, b) => b.score - a.score)

  if (matches.length > 0) return { kind: 'decisions', matches }
  return { kind: 'brief', brief: buildBrief(state, query) }
}

function buildBrief(state: UniverseState, query: string): ResearchBrief {
  // the Rumor Desk's relatedness machinery works just as well for questions
  const analysis = analyzeRumor(state, query)
  const names = analysis.matched.map((e) => e.name).join(', ') || 'the actors involved'
  return {
    matched: analysis.matched,
    related: analysis.related.slice(0, 5).map((r) => ({ event: r.event, status: r.status })),
    seek: [
      `Engineering deep-dives: design presentations (AI Day, Autonomy Day, launch webcasts) and long-form interviews where ${names} explain the choice first-hand.`,
      'Earnings-call and shareholder-meeting transcripts around the announcement window — design pivots surface in analyst Q&A before they get their own press release.',
      'Patent filings, regulatory submissions and job postings from before and after the switch — they reveal direction earlier than any announcement.',
      'Independent teardowns and technical analyses (tier 3) that test the claimed rationale against measurements rather than repeating it.',
      'Ingest what you find, then start a decision thread — the dossier assembles itself from the cited accounts.',
    ],
  }
}

// ── dossier helpers ──────────────────────────────────────────────────────

/** Linked events, chronological, with derived status. */
export function decisionThread(
  state: UniverseState,
  decision: Decision,
): { event: UniverseEvent; status: EventStatus }[] {
  return decision.eventIds
    .map((id) => state.events.find((e) => e.id === id))
    .filter((e): e is UniverseEvent => Boolean(e))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((event) => ({ event, status: statusOf(state, event) }))
}

/**
 * How well-evidenced is the rationale? Strongest tier present plus the
 * number of distinct sources cited across rationale + counterpoints.
 */
export function rationaleGrade(
  state: UniverseState,
  decision: Decision,
): { tier: 1 | 2 | 3 | 4; sources: number } {
  const srcById = sourceMap(state)
  const ids = new Set(
    [...decision.rationale, ...decision.counterpoints].flatMap((seg) => seg.sourceIds),
  )
  let best: 1 | 2 | 3 | 4 = 4
  for (const id of ids) {
    const src = srcById.get(id)
    if (src) best = Math.min(best, sourceTier(src)) as 1 | 2 | 3 | 4
  }
  return { tier: best, sources: ids.size }
}
