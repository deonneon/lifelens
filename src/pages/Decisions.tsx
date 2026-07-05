import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Decision, DecisionOutcome } from '../types'
import { useUniverse } from '../lib/store'
import { TIER_LABELS, formatDate, freshId } from '../lib/evidence'
import { decisionThread, rationaleGrade, seekDecision } from '../lib/decisions'
import { EventCard } from '../components/EventCard'
import { EntityChip, StatusBadge } from '../components/badges'
import { CiteMarks, FootnoteList, buildCitationIndex } from '../components/Citations'

const SAMPLE = 'Why did Tesla rewrite FSD from hand-coded C++ to an end-to-end neural network?'

const OUTCOME_META: Record<DecisionOutcome, { label: string; badge: string }> = {
  chosen: { label: 'Chosen', badge: 'bg-status-good/10 text-status-good ring-status-good/30' },
  rejected: { label: 'Rejected', badge: 'bg-surface-2 text-ink-400 ring-edge' },
  superseded: { label: 'Superseded', badge: 'bg-status-warn/10 text-status-warn ring-status-warn/30' },
}

function FromTo({ decision, compact }: { decision: Decision; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-ink-400 ring-1 ring-inset ring-edge">
        {decision.from}
      </span>
      <span className="font-mono text-accent-bright">→</span>
      <span className="rounded-lg bg-accent/15 px-2.5 py-1 font-medium text-ink-100 ring-1 ring-inset ring-accent/40">
        {decision.to}
      </span>
    </div>
  )
}

function DecisionCard({ decision, highlight }: { decision: Decision; highlight?: boolean }) {
  const { state } = useUniverse()
  const grade = rationaleGrade(state, decision)
  return (
    <Link
      to={`/decisions/${decision.id}`}
      className={`card card-hover block p-5 ${highlight ? 'ring-1 ring-accent/50' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow !mb-0">{decision.domain}</span>
        <span className="font-mono text-[11px] text-ink-500">{formatDate(decision.decidedDate)}</span>
        <span className="ml-auto font-mono text-[11px] text-ink-600">
          {TIER_LABELS[grade.tier]} · {grade.sources} src · {decision.eventIds.length}{' '}
          {decision.eventIds.length === 1 ? 'event' : 'events'}
        </span>
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight text-ink-100">
        {decision.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-400">{decision.question}</p>
      <div className="mt-3">
        <FromTo decision={decision} compact />
      </div>
    </Link>
  )
}

// ── index page: seek + all threads + start-a-thread ─────────────────────

export function DecisionsIndexPage() {
  const { state, addDecision } = useUniverse()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [showForm, setShowForm] = useState(false)

  const ready = query.trim().length >= 12
  const result = useMemo(() => (ready ? seekDecision(state, query) : null), [state, query, ready])

  // ── minimal thread-creation form state ─────────────────────────────────
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [domain, setDomain] = useState('engineering')
  const [participantIds, setParticipantIds] = useState<Set<string>>(new Set())
  const [rationaleText, setRationaleText] = useState('')
  const [rationaleSourceIds, setRationaleSourceIds] = useState<Set<string>>(new Set())
  const [eventSearch, setEventSearch] = useState('')
  const [eventIds, setEventIds] = useState<Set<string>>(new Set())

  const toggleIn = (set: Set<string>, id: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    apply(next)
  }

  const eventHits = useMemo(() => {
    const q = eventSearch.trim().toLowerCase()
    if (!q) return []
    return state.events
      .filter((e) => !eventIds.has(e.id) && `${e.title} ${e.summary}`.toLowerCase().includes(q))
      .slice(0, 5)
  }, [state.events, eventSearch, eventIds])

  const canCreate =
    title.trim() && from.trim() && to.trim() && /^\d{4}(-\d{2})?(-\d{2})?$/.test(date.trim())

  const create = () => {
    if (!canCreate) return
    const decision: Decision = {
      id: freshId('dec'),
      title: title.trim(),
      question: question.trim() || title.trim(),
      domain,
      from: from.trim(),
      to: to.trim(),
      decidedDate: date.trim(),
      participants: [...participantIds].map((entityId) => ({ entityId, role: 'involved' })),
      options: [],
      rationale:
        rationaleText.trim() && rationaleSourceIds.size > 0
          ? [{ text: rationaleText.trim(), sourceIds: [...rationaleSourceIds] }]
          : [],
      counterpoints: [],
      eventIds: [...eventIds],
      tags: [domain],
    }
    addDecision(decision)
    navigate(`/decisions/${decision.id}`)
  }

  return (
    <div>
      <div className="eyebrow">Design history</div>
      <h1 className="page-title">Decision Desk</h1>
      <p className="lede">
        Every major design choice is a thread: what was replaced, what replaced it, the options
        weighed, and the cited rationale — with the events around the pivot attached. Ask about a
        choice and the desk pulls the dossier; if the ledger can’t answer yet, it tells you exactly
        what to go find.
      </p>

      {/* ── seek command ─────────────────────────────────────────────── */}
      <div className="card mt-5 p-5">
        <label className="eyebrow !tracking-[0.12em]">Ask about a design choice</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={SAMPLE}
          className="mt-2 w-full rounded-lg border border-edge bg-surface-2 px-3 py-2.5 text-sm text-ink-100 placeholder-ink-600 outline-none transition focus:border-accent/60"
        />
        {!ready && (
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-500">
            <span>The answer assembles as you type.</span>
            {[
              'Why stainless steel for Starship?',
              'Why did Tesla remove radar?',
              'Why end-to-end neural network for FSD?',
            ].map((s) => (
              <button key={s} onClick={() => setQuery(s)} className="text-accent-bright hover:underline">
                {s}
              </button>
            ))}
          </div>
        )}

        {result?.kind === 'decisions' && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-ink-500">
              {result.matches.length === 1
                ? 'The ledger has this decision on file:'
                : `${result.matches.length} decision threads address this — best match first:`}
            </div>
            {result.matches.map((m, i) => (
              <DecisionCard key={m.decision.id} decision={m.decision} highlight={i === 0} />
            ))}
          </div>
        )}

        {result?.kind === 'brief' && (
          <div className="mt-4 rounded-xl border border-status-warn/25 bg-status-warn/[0.04] p-4">
            <div className="text-sm font-semibold text-status-warn">
              No decision thread covers this yet — research brief
            </div>
            {result.brief.matched.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
                <span>Characters detected:</span>
                {result.brief.matched.map((e) => (
                  <EntityChip key={e.id} entity={e} />
                ))}
              </div>
            )}
            {result.brief.related.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Adjacent history already in the ledger
                </div>
                <ul className="mt-1.5 space-y-1 text-xs">
                  {result.brief.related.map(({ event, status }) => (
                    <li key={event.id} className="flex items-center gap-2">
                      <span className="font-mono text-ink-600">{formatDate(event.date)}</span>
                      <Link to={`/events/${event.id}`} className="text-ink-200 hover:text-accent-bright hover:underline">
                        {event.title}
                      </Link>
                      <StatusBadge status={status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">What to seek</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-ink-300">
                {result.brief.seek.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <Link to="/ingest" className="text-accent-bright hover:underline">
                Ingest a source →
              </Link>
              <button onClick={() => setShowForm(true)} className="text-accent-bright hover:underline">
                Start the thread now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── all threads ──────────────────────────────────────────────── */}
      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="section-title">All decision threads</h2>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs text-accent-bright hover:underline">
          {showForm ? 'Hide form' : '+ Start a decision thread'}
        </button>
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {[...state.decisions]
          .sort((a, b) => b.decidedDate.localeCompare(a.decidedDate))
          .map((d) => (
            <DecisionCard key={d.id} decision={d} />
          ))}
      </div>

      {/* ── start a thread ───────────────────────────────────────────── */}
      {showForm && (
        <div className="card mt-6 p-5">
          <h3 className="section-title">Start a decision thread</h3>
          <p className="mt-1 text-xs text-ink-500">
            Capture the pivot now; rationale and counterpoints accumulate as sources are ingested.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — e.g. Raptor engine: film cooling → regenerative" className="input-field sm:col-span-2" />
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="The question this thread answers (optional)" className="input-field sm:col-span-2" />
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From — the prior approach" className="input-field" />
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To — the chosen approach" className="input-field" />
            <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Decided — YYYY, YYYY-MM or YYYY-MM-DD" className="input-field" />
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="input-field">
              {['engineering', 'strategy', 'product', 'finance', 'legal'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Characters involved</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {state.entities.map((e) => (
                <button
                  key={e.id}
                  onClick={() => toggleIn(participantIds, e.id, setParticipantIds)}
                  className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset transition ${
                    participantIds.has(e.id)
                      ? 'bg-accent/25 text-ink-50 ring-accent/60'
                      : 'bg-surface-2 text-ink-400 ring-edge hover:bg-surface-3'
                  }`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              First rationale segment (optional — must cite a source)
            </div>
            <textarea
              value={rationaleText}
              onChange={(e) => setRationaleText(e.target.value)}
              rows={2}
              placeholder="Why the change was made, as the sources tell it…"
              className="input-field mt-2 w-full"
            />
            <div className="mt-2 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
              {state.sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleIn(rationaleSourceIds, s.id, setRationaleSourceIds)}
                  title={s.title}
                  className={`max-w-[260px] truncate rounded-full px-2.5 py-1 text-[11px] ring-1 ring-inset transition ${
                    rationaleSourceIds.has(s.id)
                      ? 'bg-accent/25 text-ink-50 ring-accent/60'
                      : 'bg-surface-2 text-ink-500 ring-edge hover:bg-surface-3'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Link events to the thread</div>
            <input
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Search events by title…"
              className="input-field mt-2 w-full max-w-md"
            />
            {eventHits.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs">
                {eventHits.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => toggleIn(eventIds, e.id, setEventIds)}
                      className="text-ink-300 hover:text-accent-bright"
                    >
                      + <span className="font-mono text-ink-600">{formatDate(e.date)}</span> {e.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {eventIds.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...eventIds].map((id) => {
                  const e = state.events.find((ev) => ev.id === id)
                  return e ? (
                    <button
                      key={id}
                      onClick={() => toggleIn(eventIds, id, setEventIds)}
                      className="rounded-full bg-accent/20 px-2.5 py-1 text-[11px] text-ink-100 ring-1 ring-inset ring-accent/50"
                    >
                      {e.title} ✕
                    </button>
                  ) : null
                })}
              </div>
            )}
          </div>

          <button onClick={create} disabled={!canCreate} className="btn-primary mt-5 disabled:opacity-40">
            Create thread
          </button>
        </div>
      )}
    </div>
  )
}

// ── dossier page ─────────────────────────────────────────────────────────

export function DecisionPage() {
  const { id } = useParams()
  const { state } = useUniverse()
  const decision = state.decisions.find((d) => d.id === id)

  const sourceById = useMemo(() => new Map(state.sources.map((s) => [s.id, s])), [state.sources])

  const citations = useMemo(() => {
    if (!decision) return { numbers: new Map<string, number>(), ordered: [] as string[] }
    return buildCitationIndex([
      ...decision.rationale.map((r) => r.sourceIds),
      ...decision.options.map((o) => o.sourceIds ?? []),
      ...decision.counterpoints.map((c) => c.sourceIds),
    ])
  }, [decision])

  if (!decision) {
    return (
      <p className="card p-8 text-sm text-ink-400">
        Decision not found. <Link to="/decisions" className="text-accent-bright hover:underline">Back to the Decision Desk</Link>
      </p>
    )
  }

  const thread = decisionThread(state, decision)
  const grade = rationaleGrade(state, decision)
  const related = (decision.relatedDecisionIds ?? [])
    .map((rid) => state.decisions.find((d) => d.id === rid))
    .filter((d): d is Decision => Boolean(d))

  return (
    <div>
      <Link to="/decisions" className="text-xs text-ink-500 transition hover:text-accent-bright">
        ← Decision Desk
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="eyebrow !mb-0">{decision.domain} decision</span>
        <span className="font-mono text-[11px] text-ink-500">decided {formatDate(decision.decidedDate)}</span>
        <span className="ml-auto font-mono text-[11px] text-ink-600">
          rationale grade {TIER_LABELS[grade.tier]} · {grade.sources} sources
        </span>
      </div>
      <h1 className="page-title mt-1">{decision.title}</h1>
      <p className="lede">{decision.question}</p>

      <div className="mt-4">
        <FromTo decision={decision} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {decision.participants.map((p) => {
          const entity = state.entities.find((e) => e.id === p.entityId)
          return entity ? <EntityChip key={p.entityId} entity={entity} role={p.role} /> : null
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {decision.rationale.length > 0 && (
            <section className="card p-5">
              <h2 className="section-title">Why the change was made</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-200">
                {decision.rationale.map((seg, i) => (
                  <p key={i}>
                    {seg.text}
                    <CiteMarks sourceIds={seg.sourceIds} numbers={citations.numbers} sourceById={sourceById} />
                  </p>
                ))}
              </div>
            </section>
          )}

          {decision.options.length > 0 && (
            <section className="card p-5">
              <h2 className="section-title">Options weighed</h2>
              <ul className="mt-3 space-y-3">
                {decision.options.map((o, i) => (
                  <li key={i} className="rounded-xl border border-edge bg-surface-2/60 p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink-100">{o.label}</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-medium ring-1 ring-inset ${OUTCOME_META[o.outcome].badge}`}>
                        {OUTCOME_META[o.outcome].label}
                      </span>
                    </div>
                    {o.note && (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">
                        {o.note}
                        {o.sourceIds && (
                          <CiteMarks sourceIds={o.sourceIds} numbers={citations.numbers} sourceById={sourceById} />
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {decision.counterpoints.length > 0 && (
            <section className="card border-status-bad/20 p-5">
              <h2 className="section-title">Counterpoints & risks</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-200">
                {decision.counterpoints.map((seg, i) => (
                  <p key={i}>
                    {seg.text}
                    <CiteMarks sourceIds={seg.sourceIds} numbers={citations.numbers} sourceById={sourceById} />
                  </p>
                ))}
              </div>
            </section>
          )}

          <FootnoteList orderedSourceIds={citations.ordered} sourceById={sourceById} />
        </div>

        <aside className="space-y-4">
          <h2 className="section-title">The thread</h2>
          {thread.length === 0 && (
            <p className="card p-5 text-xs text-ink-500">
              No events linked yet — ingest coverage of the pivot and link it here.
            </p>
          )}
          {thread.map(({ event }) => (
            <EventCard key={event.id} event={event} />
          ))}
          {related.length > 0 && (
            <div className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Related decisions</div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {related.map((d) => (
                  <li key={d.id}>
                    <Link to={`/decisions/${d.id}`} className="text-ink-200 hover:text-accent-bright hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
