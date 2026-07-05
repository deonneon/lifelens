import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Stance } from '../types'
import { useUniverse } from '../lib/store'
import {
  STANCE_META,
  STATUS_META,
  accountsFor,
  formatDate,
  freshId,
  sourceMap,
  statusOf,
} from '../lib/evidence'
import { EntityChip, SourceTypeBadge, StanceBadge, StatusBadge, TierBadge } from '../components/badges'

export function EventPage() {
  const { id } = useParams()
  const { state, addAccount } = useUniverse()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ sourceId: '', stance: 'supports' as Stance, quote: '', locator: '' })

  const event = state.events.find((e) => e.id === id)
  if (!event) {
    return <p className="text-slate-400">Unknown event. <Link to="/timeline" className="text-sky-400">Back to the timeline.</Link></p>
  }

  const srcById = sourceMap(state)
  const accounts = accountsFor(state, event.id)
  const status = statusOf(state, event)
  const grouped: { stance: Stance; heading: string }[] = [
    { stance: 'supports', heading: 'Supporting accounts' },
    { stance: 'disputes', heading: 'Disputing accounts' },
    { stance: 'clarifies', heading: 'Clarifications' },
  ]

  const submit = () => {
    if (!form.sourceId || !form.quote.trim()) return
    addAccount({
      id: freshId('acc'),
      eventId: event.id,
      sourceId: form.sourceId,
      stance: form.stance,
      quote: form.quote.trim(),
      locator: form.locator.trim() || undefined,
    })
    setForm({ sourceId: '', stance: 'supports', quote: '', locator: '' })
    setFormOpen(false)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <span className="font-mono">{formatDate(event.date)}</span>
        {event.location && <span>· {event.location}</span>}
        <StatusBadge status={status} />
      </div>
      <h1 className="mt-2 font-serif text-3xl font-bold text-white">{event.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{event.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {event.participants.map((p) => {
          const entity = state.entities.find((e) => e.id === p.entityId)
          return entity ? <EntityChip key={p.entityId} entity={entity} role={p.role} /> : null
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {event.tags.map((t) => (
          <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-inset ring-white/10">
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <span className="font-semibold text-white">Why “{STATUS_META[status].label}”?</span>{' '}
        {STATUS_META[status].blurb}. This record has {accounts.length} account
        {accounts.length === 1 ? '' : 's'} from{' '}
        {new Set(accounts.map((a) => a.sourceId)).size} source
        {new Set(accounts.map((a) => a.sourceId)).size === 1 ? '' : 's'} — the status recomputes
        automatically as accounts are added.
      </div>

      {grouped.map(({ stance, heading }) => {
        const list = accounts.filter((a) => a.stance === stance)
        if (list.length === 0) return null
        return (
          <section key={stance} className="mt-8">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-white">
              {heading} <StanceBadge stance={stance} />
            </h2>
            <div className="mt-3 space-y-3">
              {list.map((a) => {
                const source = srcById.get(a.sourceId)
                if (!source) return null
                return (
                  <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <TierBadge source={source} />
                      <SourceTypeBadge source={source} />
                      {source.date && (
                        <span className="text-[11px] text-slate-500">{formatDate(source.date)}</span>
                      )}
                    </div>
                    <blockquote
                      className={`mt-2 border-l-2 pl-3 text-sm italic leading-relaxed text-slate-300 ${
                        stance === 'disputes' ? 'border-rose-400/50' : stance === 'clarifies' ? 'border-indigo-400/50' : 'border-emerald-400/50'
                      }`}
                    >
                      “{a.quote}”
                    </blockquote>
                    <div className="mt-2 text-xs text-slate-500">
                      — {source.title}
                      {source.author ? `, ${source.author}` : ''}
                      {a.locator ? ` · ${a.locator}` : ''}
                      {source.url && (
                        <>
                          {' '}
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">↗</a>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="mt-10 rounded-xl border border-dashed border-white/15 p-4">
        {!formOpen ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-400">
              Have another account of this event? Add it — supporting, disputing, or clarifying.
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="ml-auto rounded-full bg-accent-primary/90 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-primary"
            >
              + Add an account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-slate-400">
                Source (add new ones on the <Link to="/ingest" className="text-sky-400 hover:underline">ingest page</Link>)
                <select
                  value={form.sourceId}
                  onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
                >
                  <option value="">Choose a source…</option>
                  {state.sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-slate-400">
                Stance
                <select
                  value={form.stance}
                  onChange={(e) => setForm({ ...form, stance: e.target.value as Stance })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
                >
                  {(Object.keys(STANCE_META) as Stance[]).map((s) => (
                    <option key={s} value={s}>{STANCE_META[s].label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs text-slate-400">
              What does this source say? (quote or close paraphrase)
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Locator (page, chapter, paragraph — optional)
              <input
                value={form.locator}
                onChange={(e) => setForm({ ...form, locator: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={!form.sourceId || !form.quote.trim()}
                className="rounded-full bg-accent-primary/90 px-4 py-1.5 text-sm font-semibold text-white transition enabled:hover:bg-accent-primary disabled:opacity-40"
              >
                Attach account
              </button>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-slate-300 transition hover:border-white/30"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
