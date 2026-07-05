import { Link, useParams } from 'react-router-dom'
import { useUniverse } from '../lib/store'
import { eventsForEntity, sourceMap } from '../lib/evidence'
import { CiteMarks, FootnoteList, buildCitationIndex } from '../components/Citations'
import { EventCard } from '../components/EventCard'
import { EntityChip } from '../components/badges'

export function CharactersIndexPage() {
  const { state } = useUniverse()
  const people = state.entities.filter((e) => e.kind === 'person')
  const companies = state.entities.filter((e) => e.kind === 'company')

  const card = (id: string, name: string, origin: string | undefined, kind: string, count: number) => (
    <Link
      key={id}
      to={`/characters/${id}`}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div className="text-xs uppercase tracking-wide text-slate-500">{kind}</div>
      <div className="mt-0.5 font-serif text-lg font-semibold text-white">{name}</div>
      {origin && <div className="mt-0.5 text-xs text-slate-400">{origin}</div>}
      <div className="mt-2 text-xs text-slate-500">{count} documented events</div>
    </Link>
  )

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">Characters</h1>
      <p className="mt-2 text-sm text-slate-400">Every person and company in the universe.</p>
      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-violet-300">● People</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((e) => card(e.id, e.name, e.origin, 'person', eventsForEntity(state, e.id).length))}
      </div>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-sky-300">■ Companies</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((e) => card(e.id, e.name, e.origin, 'company', eventsForEntity(state, e.id).length))}
      </div>
    </div>
  )
}

export function CharacterPage() {
  const { id } = useParams()
  const { state } = useUniverse()
  const entity = state.entities.find((e) => e.id === id)

  if (!entity) {
    return <p className="text-slate-400">Unknown character. <Link to="/characters" className="text-sky-400">Back to the roster.</Link></p>
  }

  const srcById = sourceMap(state)
  const { numbers, ordered } = buildCitationIndex(entity.bio.map((s) => s.sourceIds))
  const events = eventsForEntity(state, entity.id)

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {entity.kind === 'person' ? '● person' : '■ company'}
        </div>
        <h1 className="mt-1 font-serif text-4xl font-bold text-white">{entity.name}</h1>
        {entity.origin && <p className="mt-1 text-sm text-slate-400">{entity.origin}</p>}

        <div className="prose-invert mt-6 max-w-none space-y-3">
          {entity.bio.map((seg, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-slate-300">
              {seg.text}
              <CiteMarks sourceIds={seg.sourceIds} numbers={numbers} sourceById={srcById} />
            </p>
          ))}
        </div>
        <FootnoteList orderedSourceIds={ordered} sourceById={srcById} />

        <h2 className="mt-10 font-serif text-xl font-bold text-white">
          Activity — {events.length} events
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Every documented spot where {entity.name} appears in the universe, in order.
        </p>
        <div className="mt-4 space-y-3">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} hideEntityId={entity.id} />
          ))}
          {events.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
              No documented events yet — <Link to="/ingest" className="text-sky-400 hover:underline">add a source</Link> that mentions {entity.name}.
            </p>
          )}
        </div>
      </div>

      <aside className="lg:pt-16">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-200">Relationships</h3>
          <ul className="mt-3 space-y-2.5">
            {entity.relationships.map((r) => {
              const target = state.entities.find((e) => e.id === r.targetId)
              return target ? (
                <li key={r.targetId} className="text-xs text-slate-400">
                  <EntityChip entity={target} />
                  <div className="mt-0.5 pl-1">{r.label}</div>
                </li>
              ) : null
            })}
            {entity.relationships.length === 0 && (
              <li className="text-xs text-slate-500">No mapped relationships yet.</li>
            )}
          </ul>
        </div>
        {entity.aliases.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-200">Also appears as</h3>
            <p className="mt-2 text-xs text-slate-400">{entity.aliases.join(' · ')}</p>
          </div>
        )}
      </aside>
    </div>
  )
}
