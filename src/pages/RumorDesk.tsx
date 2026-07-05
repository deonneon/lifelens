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
      <h1 className="font-serif text-3xl font-bold text-white">Rumor Desk</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
        A story just broke and you need to judge it <em>before</em> it resolves. Paste it below and
        the desk assembles what the universe already knows: related events and their evidence
        status, the named actors’ track records on self-reported claims, how past rumors resolved,
        and what official confirmation would look like. Context, not verdicts — the judgment (and
        the trade) is yours.
      </p>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setLoggedEventId(null)
          }}
          rows={4}
          placeholder={SAMPLE}
          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm leading-relaxed text-slate-100 placeholder-slate-600 outline-none focus:border-accent-primary/60"
        />
        {!ready && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Paste at least a headline — analysis runs as you type.</span>
            <button onClick={() => setText(SAMPLE)} className="text-sky-400 hover:underline">
              Try the sample rumor
            </button>
          </div>
        )}
      </div>

      {analysis && (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Characters named
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.matched.map((e) => (
                <EntityChip key={e.id} entity={e} />
              ))}
              {analysis.matched.length === 0 && (
                <span className="text-sm text-slate-500">
                  No known characters detected — the desk works best when the story names people or
                  companies already in the universe.
                </span>
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Related context on file
              </h3>
              <div className="mt-2 font-serif text-3xl font-bold text-white">
                {analysis.related.length}
              </div>
              <div className="mt-1 space-y-1 text-xs text-slate-400">
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

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actor track record — self-reported claims
              </h3>
              <div className="mt-2 space-y-2.5">
                {analysis.actorRecords
                  .filter((r) => r.firsthandEvents > 0)
                  .map((r) => (
                    <div key={r.entity.id} className="text-xs text-slate-300">
                      <span className="font-semibold text-white">{r.entity.name}</span>: of{' '}
                      {r.firsthandEvents} events resting on first-hand accounts,{' '}
                      <span className={r.firsthandDisputed > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                        {r.firsthandDisputed} ended formally disputed (
                        {pct(r.firsthandDisputed, r.firsthandEvents)})
                      </span>
                      {r.disputedTitles.length > 0 && (
                        <span className="block text-slate-500">
                          e.g. {r.disputedTitles.slice(0, 2).join(' · ')}
                        </span>
                      )}
                    </div>
                  ))}
                {analysis.actorRecords.every((r) => r.firsthandEvents === 0) && (
                  <p className="text-xs text-slate-500">
                    No self-reported claim history for the named characters yet.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                How rumors resolved in this corpus
              </h3>
              <div className="mt-2 font-serif text-3xl font-bold text-white">
                {analysis.baseRate.total}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                events carried tier-4 (rumor) sourcing: {analysis.baseRate.corroborated} later
                corroborated, {analysis.baseRate.disputed} disputed, {analysis.baseRate.open} still
                open. Every rumor you log below sharpens this base rate.
              </p>
            </div>
          </section>

          {analysis.anchors.length > 0 && (
            <section>
              <h2 className="font-serif text-lg font-bold text-white">
                Hardest evidence in the vicinity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Official records (tier 1) attached to the related events — the anchors any new claim
                has to be squared against.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {analysis.anchors.map((a, i) => (
                  <Link
                    key={i}
                    to={`/events/${a.eventId}`}
                    className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.04] p-4 transition hover:border-emerald-400/40"
                  >
                    <blockquote className="border-l-2 border-emerald-400/50 pl-3 text-sm italic text-slate-300">
                      “{a.quote}”
                    </blockquote>
                    <div className="mt-2 text-xs text-slate-500">
                      {a.sourceTitle} — on <span className="text-slate-300">{a.eventTitle}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {analysis.related.length > 0 && (
            <section>
              <h2 className="font-serif text-lg font-bold text-white">Related events</h2>
              <p className="mt-1 text-xs text-slate-500">
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
            <h2 className="font-serif text-lg font-bold text-white">What confirmation looks like</h2>
            <ul className="mt-3 space-y-2">
              {analysis.checklist.map((item, i) => (
                <li key={i} className="flex gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
                  <span className="text-sky-400">☐</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-dashed border-amber-400/30 bg-amber-500/[0.03] p-5">
            <h2 className="font-serif text-lg font-bold text-white">Log it and track it to resolution</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter the rumor into the universe as a tier-4 event. It joins the watchlist below and
              the timeline with <span className="text-amber-300">rumor</span> status; as
              confirmations or denials arrive, attach them on the event page and the status — and
              your base rates — update themselves.
            </p>
            {loggedEventId ? (
              <p className="mt-3 text-sm text-emerald-300">
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
                  className="w-72 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-accent-primary/60"
                />
                <select
                  value={rumorType}
                  onChange={(e) => setRumorType(e.target.value as SourceType)}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
                >
                  <option value="rumor">T4 · Rumor / unverified</option>
                  <option value="reporting">T2 · Reputable outlet</option>
                  <option value="first-hand">T3 · First-hand statement</option>
                </select>
                <button
                  onClick={logRumor}
                  className="rounded-full bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-200 ring-1 ring-inset ring-amber-400/40 transition hover:bg-amber-500/30"
                >
                  Log to watchlist
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-lg font-bold text-white">
          Rumor watchlist — {watchlist.length}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Every logged rumor and where it stands now. Resolved ones feed the base rate above.
        </p>
        <div className="mt-3 space-y-2">
          {watchlist.map((ev) => (
            <Link
              key={ev.id}
              to={`/events/${ev.id}`}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25"
            >
              <span className="font-mono text-xs text-slate-500">{formatDate(ev.date)}</span>
              <StatusBadge status={statusOf(state, ev)} />
              <span className="text-sm text-slate-200">{ev.title}</span>
            </Link>
          ))}
          {watchlist.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-500">
              Nothing tracked yet — analyze a story above and log it to start building your own
              resolution history.
            </p>
          )}
        </div>
      </section>

      <p className="mt-8 text-[11px] text-slate-600">
        Decision support built from cited history — not financial advice. The desk shows what is
        documented; it cannot know what is true today.
      </p>
    </div>
  )
}
