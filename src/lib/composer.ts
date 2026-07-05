import type { Source, UniverseState } from '../types'
import { STATUS_META, accountsFor, formatDate, sourceMap } from './evidence'
import { analyzeRumor } from './judge'
import type { RumorAnalysis } from './judge'

/**
 * The Explainer Studio: turn a news story plus the evidence ledger into a
 * publishable explainer — a long-form cited article and an X/Twitter thread.
 * Everything is assembled from accounts already in the corpus, so every
 * sentence in the output is traceable; contested events show both sides.
 */

export interface ComposeSelection {
  entityIds: string[]
  eventIds: string[]
}

export interface Explainer {
  markdown: string
  tweets: string[]
  /** sourceIds in citation order, matching [n] markers in the markdown. */
  sourceOrder: string[]
}

export const TWEET_LIMIT = 280

/** Word-boundary truncation with an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const atWord = cut.lastIndexOf(' ')
  return `${cut.slice(0, atWord > max * 0.6 ? atWord : max - 1).trimEnd()}…`
}

function shortSourceLabel(source: Source): string {
  return source.publisher ?? source.author ?? truncate(source.title, 40)
}

/** Default selection: everything the analysis matched. */
export function defaultSelection(analysis: RumorAnalysis): ComposeSelection {
  return {
    entityIds: analysis.matched.map((e) => e.id),
    eventIds: analysis.related.map((r) => r.event.id),
  }
}

export function composeExplainer(
  state: UniverseState,
  newsText: string,
  selection: ComposeSelection,
): Explainer {
  const analysis = analyzeRumor(state, newsText)
  const srcById = sourceMap(state)

  const entities = analysis.matched.filter((e) => selection.entityIds.includes(e.id))
  const events = analysis.related
    .filter((r) => selection.eventIds.includes(r.event.id))
    .sort((a, b) => a.event.date.localeCompare(b.event.date))

  // ── citation numbering, in order of first appearance ────────────────────
  const sourceOrder: string[] = []
  const numbers = new Map<string, number>()
  const cite = (sourceIds: string[]): string => {
    const marks = sourceIds
      .filter((id) => srcById.has(id))
      .map((id) => {
        if (!numbers.has(id)) {
          sourceOrder.push(id)
          numbers.set(id, sourceOrder.length)
        }
        return `[${numbers.get(id)}]`
      })
    return marks.join('')
  }

  const headline = truncate(newsText.trim().replace(/\s+/g, ' '), 220)

  // ── markdown article ─────────────────────────────────────────────────────
  const md: string[] = []
  md.push('# The context behind the story', '')
  md.push(`> ${newsText.trim().replace(/\s+/g, ' ')}`, '')
  md.push(
    '*Assembled from a cited evidence ledger: every claim below carries its sources, and contested points show both sides.*',
    '',
  )

  if (entities.length > 0) {
    md.push('## The players', '')
    for (const e of entities) {
      md.push(`### ${e.name}${e.origin ? ` — ${e.origin}` : ''}`, '')
      for (const seg of e.bio) {
        md.push(`${seg.text} ${cite(seg.sourceIds)}`.trim(), '')
      }
    }
  }

  if (events.length > 0) {
    md.push('## The history you need', '')
    for (const r of events) {
      const supporting = accountsFor(state, r.event.id)
        .filter((a) => a.stance !== 'disputes')
        .map((a) => a.sourceId)
      md.push(
        `**${formatDate(r.event.date)} — ${r.event.title}.** ${r.event.summary} ${cite([...new Set(supporting)])} *(${STATUS_META[r.status].label.toLowerCase()})*`,
        '',
      )
    }
  }

  const contested = events.filter((r) => r.status === 'disputed')
  if (contested.length > 0) {
    md.push('## Contested ground', '')
    md.push('These parts of the record are formally disputed — read both sides:', '')
    for (const r of contested) {
      md.push(`### ${r.event.title}`, '')
      for (const a of accountsFor(state, r.event.id)) {
        const src = srcById.get(a.sourceId)
        if (!src) continue
        const label = a.stance === 'disputes' ? 'Disputes' : a.stance === 'clarifies' ? 'Clarifies' : 'Supports'
        md.push(`- **${label}:** “${a.quote}” — ${src.title} ${cite([a.sourceId])}`)
      }
      md.push('')
    }
  }

  const records = analysis.actorRecords.filter(
    (r) => selection.entityIds.includes(r.entity.id) && r.firsthandEvents > 0 && r.firsthandDisputed > 0,
  )
  if (records.length > 0) {
    md.push('## Track records worth knowing', '')
    for (const r of records) {
      md.push(
        `- **${r.entity.name}**: of ${r.firsthandEvents} events in this ledger resting on first-hand accounts, ${r.firsthandDisputed} ended formally disputed (e.g. ${r.disputedTitles.slice(0, 2).join('; ')}).`,
      )
    }
    md.push('')
  }

  if (sourceOrder.length > 0) {
    md.push('## Sources', '')
    sourceOrder.forEach((id, i) => {
      const s = srcById.get(id)
      if (!s) return
      const bits = [s.author, s.publisher, s.date ? formatDate(s.date) : undefined]
        .filter(Boolean)
        .join(', ')
      md.push(`${i + 1}. ${s.title}${bits ? ` — ${bits}` : ''}${s.url ? ` — ${s.url}` : ''}`)
    })
    md.push('')
  }

  // ── X/Twitter thread ─────────────────────────────────────────────────────
  const body: string[] = []
  body.push(`${headline}\n\nWhat the record actually shows — a thread with receipts. 🧵`)

  if (entities.length > 0) {
    const players = entities
      .map((e) => `${e.name}${e.origin ? ` (${truncate(e.origin, 40)})` : ''}`)
      .join(' · ')
    body.push(truncate(`The players: ${players}`, TWEET_LIMIT - 8))
  }

  for (const r of events) {
    const supporting = accountsFor(state, r.event.id).filter((a) => a.stance !== 'disputes')
    const firstSrc = supporting[0] ? srcById.get(supporting[0].sourceId) : undefined
    const srcBit = firstSrc ? ` (src: ${shortSourceLabel(firstSrc)})` : ''
    const stamp = `${formatDate(r.event.date)} — `
    const room = TWEET_LIMIT - 8 - stamp.length - srcBit.length
    body.push(`${stamp}${truncate(`${r.event.title}. ${r.event.summary}`, room)}${srcBit}`)

    if (r.status === 'disputed') {
      const disputing = accountsFor(state, r.event.id).find((a) => a.stance === 'disputes')
      const dSrc = disputing ? srcById.get(disputing.sourceId) : undefined
      if (disputing && dSrc) {
        const tail = ` — ${shortSourceLabel(dSrc)}`
        body.push(
          `⚠️ But this is disputed: “${truncate(disputing.quote, TWEET_LIMIT - 8 - 28 - tail.length)}”${tail}`,
        )
      }
    }
  }

  for (const r of records) {
    body.push(
      truncate(
        `Track record: of ${r.firsthandEvents} events here resting on ${r.entity.name}'s own account, ${r.firsthandDisputed} ended formally disputed. Weigh today's claims accordingly.`,
        TWEET_LIMIT - 8,
      ),
    )
  }

  body.push(
    truncate(
      `Everything above traces to ${sourceOrder.length} sources — filings, biographies, reporting, primary statements. Judge the story against the record, not the headline.`,
      TWEET_LIMIT - 8,
    ),
  )

  const total = body.length
  const tweets = body.map((t, i) => `${i + 1}/${total} ${t}`)

  return { markdown: md.join('\n'), tweets, sourceOrder }
}
