import { Link, useParams } from 'react-router-dom'
import { useUniverse } from '../lib/store'
import { eventsForEntity, formatDate, sourceMap } from '../lib/evidence'
import { SIGNIFICANCE_THRESHOLD } from '../lib/mentions'
import { CiteMarks, FootnoteList, buildCitationIndex } from '../components/Citations'
import { EventCard } from '../components/EventCard'
import { EntityChip } from '../components/badges'

export function CharactersIndexPage() {
  const { state, promotePending, dismissPending } = useUniverse()
  const people = state.entities.filter((e) => e.kind === 'person')
  const companies = state.entities.filter((e) => e.kind === 'company')
  const watching = state.pending.filter((p) => !p.dismissed)

  const card = (id: string, name: string, origin: string | undefined, kind: string, count: number) => (
    <Link
      key={id}
      to={`/characters/${id}`}
      className="card p-4 transition hover:border-edge-bright hover:bg-surface-2"
    >
      <div className="text-xs uppercase tracking-wide text-ink-500">{kind}</div>
      <div className="mt-0.5 font-display text-lg font-semibold text-ink-50">{name}</div>
      {origin && <div className="mt-0.5 text-xs text-ink-400">{origin}</div>}
      <div className="mt-2 text-xs text-ink-500">{count} documented events</div>
    </Link>
  )

  return (
    <div>
      <div className="eyebrow">Dossiers</div>
      <h1 className="page-title">Characters</h1>
      <p className="lede">Every person and company in the universe.</p>
      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent-bright">● People</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((e) => card(e.id, e.name, e.origin, 'person', eventsForEntity(state, e.id).length))}
      </div>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-status-info">■ Companies</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((e) => card(e.id, e.name, e.origin, 'company', eventsForEntity(state, e.id).length))}
      </div>

      <section id="orbit-watch" className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-status-warn">
          ◌ Orbit watch — {watching.length} pending
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-400">
          Names that sources mention but that haven’t yet earned a place in the universe. A name is
          promoted to a full character automatically once it appears in{' '}
          <span className="text-ink-100">{SIGNIFICANCE_THRESHOLD} distinct documented events</span>{' '}
          — or immediately, if your judgment says it already matters. Everything else stays here so
          the universe doesn’t fill with walk-on parts.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {watching.map((p) => {
            const eventIds = [...new Set(p.mentions.map((m) => m.eventId))]
            return (
              <div key={p.id} className="rounded-xl border border-status-warn/25 bg-status-warn/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <span className={p.kindGuess === 'person' ? 'text-accent-bright' : 'text-status-info'}>
                    {p.kindGuess === 'person' ? '●' : '■'}
                  </span>
                  <span className="font-display text-base font-semibold text-ink-100">{p.name}</span>
                  <span className="ml-auto font-mono text-xs text-status-warn">
                    {eventIds.length} / {SIGNIFICANCE_THRESHOLD} events
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-status-warn/80"
                    style={{ width: `${Math.min(100, (eventIds.length / SIGNIFICANCE_THRESHOLD) * 100)}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-1 text-xs text-ink-400">
                  {eventIds.map((id) => {
                    const ev = state.events.find((e) => e.id === id)
                    return ev ? (
                      <li key={id}>
                        <Link to={`/events/${id}`} className="hover:text-ink-100 hover:underline">
                          {formatDate(ev.date)} — {ev.title}
                        </Link>
                      </li>
                    ) : null
                  })}
                </ul>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => promotePending(p.id)}
                    className="rounded-full bg-status-warn/15 px-3 py-1 text-xs font-semibold text-status-warn ring-1 ring-inset ring-status-warn/40 transition hover:bg-status-warn/25"
                  >
                    Promote now
                  </button>
                  <button
                    onClick={() => dismissPending(p.id)}
                    className="rounded-full border border-edge px-3 py-1 text-xs text-ink-400 transition hover:border-edge-bright hover:text-ink-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )
          })}
          {watching.length === 0 && (
            <p className="card p-6 text-sm text-ink-500 sm:col-span-2">
              Nothing on the watch list — unknown names detected during ingestion will appear here.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export function CharacterPage() {
  const { id } = useParams()
  const { state } = useUniverse()
  const entity = state.entities.find((e) => e.id === id)

  if (!entity) {
    return <p className="text-ink-400">Unknown character. <Link to="/characters" className="text-accent-bright">Back to the roster.</Link></p>
  }

  const srcById = sourceMap(state)
  const { numbers, ordered } = buildCitationIndex(entity.bio.map((s) => s.sourceIds))
  const events = eventsForEntity(state, entity.id)

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="text-xs uppercase tracking-wide text-ink-500">
          {entity.kind === 'person' ? '● person' : '■ company'}
        </div>
        <h1 className="page-title">{entity.name}</h1>
        {entity.origin && <p className="mt-1 text-sm text-ink-400">{entity.origin}</p>}

        <div className="prose-invert mt-6 max-w-none space-y-3">
          {entity.bio.map((seg, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink-300">
              {seg.text}
              <CiteMarks sourceIds={seg.sourceIds} numbers={numbers} sourceById={srcById} />
            </p>
          ))}
        </div>
        <FootnoteList orderedSourceIds={ordered} sourceById={srcById} />

        <h2 className="mt-10 font-display text-xl font-bold text-ink-50">
          Activity — {events.length} events
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Every documented spot where {entity.name} appears in the universe, in order.
        </p>
        <div className="mt-4 space-y-3">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} hideEntityId={entity.id} />
          ))}
          {events.length === 0 && (
            <p className="card p-6 text-sm text-ink-400">
              No documented events yet — <Link to="/ingest" className="text-accent-bright hover:underline">add a source</Link> that mentions {entity.name}.
            </p>
          )}
        </div>
      </div>

      <aside className="lg:pt-16">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-ink-100">Relationships</h3>
          <ul className="mt-3 space-y-2.5">
            {entity.relationships.map((r) => {
              const target = state.entities.find((e) => e.id === r.targetId)
              return target ? (
                <li key={r.targetId} className="text-xs text-ink-400">
                  <EntityChip entity={target} />
                  <div className="mt-0.5 pl-1">{r.label}</div>
                </li>
              ) : null
            })}
            {entity.relationships.length === 0 && (
              <li className="text-xs text-ink-500">No mapped relationships yet.</li>
            )}
          </ul>
        </div>
        {entity.aliases.length > 0 && (
          <div className="mt-4 card p-4">
            <h3 className="text-sm font-semibold text-ink-100">Also appears as</h3>
            <p className="mt-2 text-xs text-ink-400">{entity.aliases.join(' · ')}</p>
          </div>
        )}
      </aside>
    </div>
  )
}
