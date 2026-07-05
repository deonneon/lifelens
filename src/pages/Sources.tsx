import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUniverse } from '../lib/store'
import {
  SOURCE_TYPE_META,
  accountsForSource,
  formatDate,
  sourceTier,
} from '../lib/evidence'
import { SourceTypeBadge, StanceBadge, TierBadge } from '../components/badges'

export function SourcesPage() {
  const { state } = useUniverse()
  const [open, setOpen] = useState<string | null>(null)

  const sorted = [...state.sources].sort(
    (a, b) => sourceTier(a) - sourceTier(b) || (a.date ?? '').localeCompare(b.date ?? ''),
  )

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">Source Library</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        Everything in the universe traces back to here. Sources are tiered by reliability — official
        records outrank reporting and biographies, which outrank the actors’ own accounts, which
        outrank rumors. Rumors are still welcome: they enter as tier-4 accounts and get judged
        against everything else.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
        {Object.entries(SOURCE_TYPE_META).map(([key, meta]) => (
          <span key={key} className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-inset ring-white/10" title={meta.blurb}>
            T{meta.tier} · {meta.label}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {sorted.map((source) => {
          const accounts = accountsForSource(state, source.id)
          const isOpen = open === source.id
          return (
            <div key={source.id} className="rounded-xl border border-white/10 bg-white/[0.03]">
              <button
                onClick={() => setOpen(isOpen ? null : source.id)}
                className="flex w-full flex-wrap items-center gap-2 p-4 text-left"
              >
                <TierBadge source={source} />
                <SourceTypeBadge source={source} />
                <span className="font-serif text-sm font-semibold text-slate-100">{source.title}</span>
                <span className="ml-auto text-xs text-slate-500">
                  {source.author && `${source.author} · `}
                  {source.publisher && `${source.publisher} · `}
                  {source.date && `${formatDate(source.date)} · `}
                  {accounts.length} account{accounts.length === 1 ? '' : 's'} {isOpen ? '▾' : '▸'}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-white/10 p-4">
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">
                      {source.url} ↗
                    </a>
                  )}
                  <ul className="mt-2 space-y-2">
                    {accounts.map((a) => {
                      const ev = state.events.find((e) => e.id === a.eventId)
                      return ev ? (
                        <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <StanceBadge stance={a.stance} />
                          <Link to={`/events/${ev.id}`} className="text-slate-200 hover:text-white hover:underline">
                            {ev.title}
                          </Link>
                          <span className="text-xs text-slate-500">({formatDate(ev.date)})</span>
                        </li>
                      ) : null
                    })}
                    {accounts.length === 0 && (
                      <li className="text-xs text-slate-500">
                        Not yet attached to any event — attach it from an event page or the ingest flow.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
