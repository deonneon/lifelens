import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { SourceType } from '../types'
import { useUniverse } from '../lib/store'
import { STATUS_META, formatDate, freshId, statusOf } from '../lib/evidence'
import { analyzeRumor } from '../lib/judge'
import { EventCard } from '../components/EventCard'
import { EntityChip, StatusBadge } from '../components/badges'

const SAMPLE =
  'Rumor: sources say Apple is in advanced talks to acquire Tesla, with Tim Cook and Elon Musk meeting last week to discuss a deal.'

const cleanQuote = (q: string) => q.replace(/^[“”"']+/, '').replace(/[“”"']+$/, '')

export function RumorDeskPage() {
  const { state, addSource, addEvent } = useUniverse()
  const [params] = useSearchParams()
  const [text, setText] = useState(params.get('q') ?? '')
  const [outlet, setOutlet] = useState('')
  const [rumorType, setRumorType] = useState<SourceType>('rumor')
  const [loggedEventId, setLoggedEventId] = useState<string | null>(null)

  const ready = text.trim().length >= 25
  const analysis = useMemo(() => (ready ? analyzeRumor(state, text) : null), [state, text, ready])

  const watchlist = state.events
    .filter((ev) => ev.tags.includes('rumor-watch'))
    .sort((a, b) => b.date.localeCompare(a.date))

  const logRumor = () => {
    if (!analysis) return
    const sourceId = freshId('src')
    const eventId = freshId('ev')
    const today = new Date().toISOString().slice(0, 10)
    const trimmed = text.trim()
    addSource({
      id: sourceId,
      type: rumorType,
      title: outlet.trim() ? `${outlet.trim()} — unverified report` : `Unverified report logged ${today}`,
      publisher: outlet.trim() || undefined,
      date: today,
    })
    addEvent(
      {
        id: eventId,
        date: today,
        title: trimmed.length > 90 ? `${trimmed.slice(0, 87)}…` : trimmed,
        summary: trimmed,
        participants: analysis.matched.map((e) => ({ entityId: e.id, role: 'named in rumor' })),
        tags: ['rumor-watch'],
      },
      [
        {
          id: freshId('acc'),
          eventId,
          sourceId,
          stance: 'supports',
          quote: trimmed.length > 300 ? `${trimmed.slice(0, 297)}…` : trimmed,
        },
      ],
    )
    setLoggedEventId(eventId)
  }

  const pct = (n: number, d: number) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`)

  return (
    <div>
      <div className="eyebrow">Live judgment</div>
      <h1 className="page-title">Rumor Desk</h1>
      <p className="lede">
        A story just broke and you need to judge it <em>before</em> it resolves. Paste it below and
        the desk assembles what the universe already knows: related events and their evidence
        status, the named actors’ track records on self-reported claims, how past rumors resolved,
        and what official confirmation would look like. Context, not verdicts — the judgment (and
        the trade) is yours.
      </p>

      <div className="mt-5 card p-5">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setLoggedEventId(null)
          }}
          rows={4}
          placeholder={SAMPLE}
          className="w-full rounded-lg border border-edge bg-surface-2 px-3 py-2 text-sm leading-relaxed text-ink-100 placeholder-ink-600 outline-none focus:border-accent/60"
        />
        {!ready && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span>Paste at least a headline — analysis runs as you type.</span>
            <button onClick={() => setText(SAMPLE)} className="text-accent-bright hover:underline">
              Try the sample rumor
            </button>
          </div>
        )}
      </div>

      {analysis && (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Characters named
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.matched.map((e) => (
                <EntityChip key={e.id} entity={e} />
              ))}
              {analysis.matched.length === 0 && (
                <span className="text-sm text-ink-500">
                  No known characters detected — the desk works best when the story names people or
                  companies already in the universe.
                </span>
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Related context on file
              </h3>
              <div className="mt-2 font-display text-3xl font-bold text-ink-50">
                {analysis.related.length}
              </div>
              <div className="mt-1 space-y-1 text-xs text-ink-400">
                {(['corroborated', 'disputed', 'rumor', 'single-source'] as const).map((s) => {
                  const n = analysis.related.filter((r) => r.status === s).length
                  return n > 0 ? (
                    <div key={s} className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
                      {n} {STATUS_META[s].label.toLowerCase()}
                    </div>
                  ) : null
                })}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Actor track record — self-reported claims
              </h3>
              <div className="mt-2 space-y-2.5">
                {analysis.actorRecords
                  .filter((r) => r.firsthandEvents > 0)
                  .map((r) => (
                    <div key={r.entity.id} className="text-xs text-ink-300">
                      <span className="font-semibold text-ink-50">{r.entity.name}</span>: of{' '}
                      {r.firsthandEvents} events resting on first-hand accounts,{' '}
                      <span className={r.firsthandDisputed > 0 ? 'text-status-bad' : 'text-status-good'}>
                        {r.firsthandDisputed} ended formally disputed (
                        {pct(r.firsthandDisputed, r.firsthandEvents)})
                      </span>
                      {r.disputedTitles.length > 0 && (
                        <span className="block text-ink-500">
                          e.g. {r.disputedTitles.slice(0, 2).join(' · ')}
                        </span>
                      )}
                    </div>
                  ))}
                {analysis.actorRecords.every((r) => r.firsthandEvents === 0) && (
                  <p className="text-xs text-ink-500">
                    No self-reported claim history for the named characters yet.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                How rumors resolved in this corpus
              </h3>
              <div className="mt-2 font-display text-3xl font-bold text-ink-50">
                {analysis.baseRate.total}
              </div>
              <p className="mt-1 text-xs text-ink-400">
                events carried tier-4 (rumor) sourcing: {analysis.baseRate.corroborated} later
                corroborated, {analysis.baseRate.disputed} disputed, {analysis.baseRate.open} still
                open. Every rumor you log below sharpens this base rate.
              </p>
            </div>
          </section>

          {analysis.anchors.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-ink-50">
                Hardest evidence in the vicinity
              </h2>
              <p className="mt-1 text-xs text-ink-500">
                Official records (tier 1) attached to the related events — the anchors any new claim
                has to be squared against.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {analysis.anchors.map((a, i) => (
                  <Link
                    key={i}
                    to={`/events/${a.eventId}`}
                    className="rounded-xl border border-status-good/25 bg-status-good/[0.05] p-4 transition hover:border-status-good/45"
                  >
                    <blockquote className="border-l-2 border-status-good/50 pl-3 text-sm italic text-ink-300">
                      “{cleanQuote(a.quote)}”
                    </blockquote>
                    <div className="mt-2 text-xs text-ink-500">
                      {a.sourceTitle} — on <span className="text-ink-300">{a.eventTitle}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {analysis.related.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-ink-50">Related events</h2>
              <p className="mt-1 text-xs text-ink-500">
                Ranked by shared characters and subject overlap. Open one to read every account for
                and against.
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {analysis.related.map((r) => (
                  <EventCard key={r.event.id} event={r.event} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-lg font-bold text-ink-50">What confirmation looks like</h2>
            <ul className="mt-3 space-y-2">
              {analysis.checklist.map((item, i) => (
                <li key={i} className="flex gap-2.5 rounded-lg border border-edge bg-surface-1 px-4 py-2.5 text-sm text-ink-300">
                  <span className="text-accent-bright">☐</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-dashed border-status-warn/30 bg-status-warn/[0.04] p-5">
            <h2 className="font-display text-lg font-bold text-ink-50">Log it and track it to resolution</h2>
            <p className="mt-1 text-sm text-ink-400">
              Enter the rumor into the universe as a tier-4 event. It joins the watchlist below and
              the timeline with <span className="text-status-warn">rumor</span> status; as
              confirmations or denials arrive, attach them on the event page and the status — and
              your base rates — update themselves.
            </p>
            {loggedEventId ? (
              <p className="mt-3 text-sm text-status-good">
                Logged.{' '}
                <Link to={`/events/${loggedEventId}`} className="underline">
                  Open the event
                </Link>{' '}
                to attach accounts as the story develops.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={outlet}
                  onChange={(e) => setOutlet(e.target.value)}
                  placeholder="Where did you see it? (outlet, account, chatroom…)"
                  className="w-72 rounded-lg border border-edge bg-surface-2 px-3 py-2 text-sm text-ink-100 placeholder-ink-600 outline-none focus:border-accent/60"
                />
                <select
                  value={rumorType}
                  onChange={(e) => setRumorType(e.target.value as SourceType)}
                  className="rounded-lg border border-edge bg-surface-2 px-3 py-2 text-sm text-ink-100 outline-none focus:border-accent/60"
                >
                  <option value="rumor">T4 · Rumor / unverified</option>
                  <option value="reporting">T2 · Reputable outlet</option>
                  <option value="first-hand">T3 · First-hand statement</option>
                </select>
                <button
                  onClick={logRumor}
                  className="rounded-full bg-status-warn/15 px-4 py-2 text-sm font-semibold text-status-warn ring-1 ring-inset ring-status-warn/40 transition hover:bg-status-warn/25"
                >
                  Log to watchlist
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink-50">
          Rumor watchlist — {watchlist.length}
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Every logged rumor and where it stands now. Resolved ones feed the base rate above.
        </p>
        <div className="mt-3 space-y-2">
          {watchlist.map((ev) => (
            <Link
              key={ev.id}
              to={`/events/${ev.id}`}
              className="flex flex-wrap items-center gap-2 card px-4 py-3 transition hover:border-edge-bright"
            >
              <span className="font-mono text-xs text-ink-500">{formatDate(ev.date)}</span>
              <StatusBadge status={statusOf(state, ev)} />
              <span className="text-sm text-ink-100">{ev.title}</span>
            </Link>
          ))}
          {watchlist.length === 0 && (
            <p className="card p-6 text-sm text-ink-500">
              Nothing tracked yet — analyze a story above and log it to start building your own
              resolution history.
            </p>
          )}
        </div>
      </section>

      <p className="mt-8 text-[11px] text-ink-600">
        Decision support built from cited history — not financial advice. The desk shows what is
        documented; it cannot know what is true today.
      </p>
    </div>
  )
}
