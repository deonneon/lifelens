import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { SourceType, Stance } from '../types'
import { useUniverse } from '../lib/store'
import { SOURCE_TYPE_META, formatDate, freshId, yearOf } from '../lib/evidence'
import { extractEvents } from '../lib/extract'
import type { CandidateEvent } from '../lib/extract'

interface ReviewRow extends CandidateEvent {
  include: boolean
  /** '' = create a new event; otherwise merge as an account on this event. */
  mergeInto: string
  stance: Stance
}

export function IngestPage() {
  const { state, addSource, addEvent, addAccount } = useUniverse()
  const navigate = useNavigate()

  const [meta, setMeta] = useState({
    title: '',
    type: 'reporting' as SourceType,
    author: '',
    publisher: '',
    date: '',
    url: '',
  })
  const [text, setText] = useState('')
  const [rows, setRows] = useState<ReviewRow[] | null>(null)
  const [method, setMethod] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const suggestions = (row: ReviewRow) =>
    state.events.filter(
      (ev) =>
        Math.abs(Number(yearOf(ev.date)) - Number(yearOf(row.date))) <= 1 &&
        ev.participants.some((p) => row.entityIds.includes(p.entityId)),
    )

  const runExtraction = async () => {
    setBusy(true)
    try {
      const result = await extractEvents(text, state.entities)
      setMethod(result.method)
      setRows(
        result.candidates.map((c) => {
          const near = state.events.find(
            (ev) =>
              yearOf(ev.date) === yearOf(c.date) &&
              ev.participants.some((p) => c.entityIds.includes(p.entityId)),
          )
          return { ...c, include: true, mergeInto: near?.id ?? '', stance: 'supports' as Stance }
        }),
      )
    } finally {
      setBusy(false)
    }
  }

  const updateRow = (i: number, patch: Partial<ReviewRow>) => {
    setRows((prev) => prev?.map((r, j) => (j === i ? { ...r, ...patch } : r)) ?? null)
  }

  const commit = () => {
    if (!rows) return
    const sourceId = freshId('src')
    addSource({
      id: sourceId,
      type: meta.type,
      title: meta.title.trim(),
      author: meta.author.trim() || undefined,
      publisher: meta.publisher.trim() || undefined,
      date: meta.date || undefined,
      url: meta.url.trim() || undefined,
    })
    for (const row of rows) {
      if (!row.include) continue
      if (row.mergeInto) {
        addAccount({
          id: freshId('acc'),
          eventId: row.mergeInto,
          sourceId,
          stance: row.stance,
          quote: row.quote,
        })
      } else {
        const eventId = freshId('ev')
        addEvent(
          {
            id: eventId,
            date: row.date,
            title: row.title,
            summary: row.summary,
            participants: row.entityIds.map((entityId) => ({ entityId, role: 'participant' })),
            tags: ['ingested'],
          },
          [{ id: freshId('acc'), eventId, sourceId, stance: 'supports', quote: row.quote }],
        )
      }
    }
    navigate('/timeline')
  }

  const metaValid = meta.title.trim().length > 0

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-bold text-white">Ingest a source</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Paste an excerpt from any source — a biography chapter, an SEC filing, a news story, even a
        rumor. LifeLens proposes events from it; you review each one and either{' '}
        <span className="text-slate-200">merge it into an existing event</span> (as a supporting,
        disputing, or clarifying account) or <span className="text-slate-200">create a new event</span>.
        Nothing is ever overwritten — the universe only grows.
      </p>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-slate-200">1 · Describe the source</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-400 sm:col-span-2">
            Title *
            <input
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              placeholder="e.g. Power Play: Tesla, Elon Musk, and the Bet of the Century — ch. 12"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Kind of source
            <select
              value={meta.type}
              onChange={(e) => setMeta({ ...meta, type: e.target.value as SourceType })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
            >
              {(Object.keys(SOURCE_TYPE_META) as SourceType[]).map((t) => (
                <option key={t} value={t}>
                  T{SOURCE_TYPE_META[t].tier} · {SOURCE_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-400">
            Publication date
            <input
              type="date"
              value={meta.date}
              onChange={(e) => setMeta({ ...meta, date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Author
            <input
              value={meta.author}
              onChange={(e) => setMeta({ ...meta, author: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Publisher / outlet
            <input
              value={meta.publisher}
              onChange={(e) => setMeta({ ...meta, publisher: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
            />
          </label>
          <label className="block text-xs text-slate-400 sm:col-span-2">
            URL
            <input
              value={meta.url}
              onChange={(e) => setMeta({ ...meta, url: e.target.value })}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
            />
          </label>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-slate-200">2 · Paste the text</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="In October 2008 Musk took over as CEO of Tesla, and by December 24 the company closed a rescue round hours before insolvency…"
          className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm leading-relaxed text-slate-100 outline-none focus:border-accent-primary/60"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={runExtraction}
            disabled={!metaValid || text.trim().length < 30 || busy}
            className="rounded-full bg-accent-primary/90 px-5 py-2 text-sm font-semibold text-white transition enabled:hover:bg-accent-primary disabled:opacity-40"
          >
            {busy ? 'Extracting…' : 'Extract events'}
          </button>
          <span className="text-xs text-slate-500">
            Uses your LLM key if configured (Gemini or OpenAI); otherwise a built-in
            date-and-name matcher.
          </span>
        </div>
      </section>

      {rows && (
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-200">
            3 · Review {rows.length} proposed event{rows.length === 1 ? '' : 's'}
            <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-normal text-slate-400 ring-1 ring-inset ring-white/10">
              extracted via {method}
            </span>
          </h2>
          {rows.length === 0 && (
            <p className="mt-3 text-sm text-slate-400">
              Nothing dateable found. The built-in matcher needs sentences containing a date and a
              known character — or configure an LLM key in <code>.env</code> for smarter extraction.
            </p>
          )}
          <div className="mt-3 space-y-4">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 transition ${
                  row.include ? 'border-white/15 bg-slate-900/50' : 'border-white/5 opacity-50'
                }`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) => updateRow(i, { include: e.target.checked })}
                      className="h-4 w-4 accent-violet-500"
                    />
                    include
                  </label>
                  <input
                    value={row.date}
                    onChange={(e) => updateRow(i, { date: e.target.value })}
                    className="w-28 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-100 outline-none focus:border-accent-primary/60"
                  />
                  <input
                    value={row.title}
                    onChange={(e) => updateRow(i, { title: e.target.value })}
                    className="min-w-48 flex-1 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:border-accent-primary/60"
                  />
                </div>
                <blockquote className="mt-2 border-l-2 border-white/15 pl-3 text-xs italic text-slate-400">
                  “{row.quote}”
                </blockquote>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {state.entities.map((e) => {
                    const on = row.entityIds.includes(e.id)
                    return (
                      <button
                        key={e.id}
                        onClick={() =>
                          updateRow(i, {
                            entityIds: on
                              ? row.entityIds.filter((id) => id !== e.id)
                              : [...row.entityIds, e.id],
                          })
                        }
                        className={`rounded-full px-2.5 py-0.5 text-[11px] ring-1 ring-inset transition ${
                          on
                            ? 'bg-accent-primary/25 text-white ring-accent-primary/60'
                            : 'bg-white/5 text-slate-500 ring-white/10 hover:text-slate-300'
                        }`}
                      >
                        {e.name}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <select
                    value={row.mergeInto}
                    onChange={(e) => updateRow(i, { mergeInto: e.target.value })}
                    className="max-w-md rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-accent-primary/60"
                  >
                    <option value="">➕ Create as a new event</option>
                    {suggestions(row).map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        ⇢ Attach to: {ev.title} ({formatDate(ev.date)})
                      </option>
                    ))}
                  </select>
                  {row.mergeInto && (
                    <select
                      value={row.stance}
                      onChange={(e) => updateRow(i, { stance: e.target.value as Stance })}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-accent-primary/60"
                    >
                      <option value="supports">supports it</option>
                      <option value="disputes">disputes it</option>
                      <option value="clarifies">clarifies it</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
          {rows.some((r) => r.include) && (
            <button
              onClick={commit}
              className="mt-5 rounded-full bg-emerald-500/90 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Commit {rows.filter((r) => r.include).length} to the universe
            </button>
          )}
        </section>
      )}

      <p className="mt-6 text-xs text-slate-500">
        Prefer to attach testimony to a specific event directly? Open it from the{' '}
        <Link to="/timeline" className="text-sky-400 hover:underline">timeline</Link> and use “Add an account”.
      </p>
    </div>
  )
}
