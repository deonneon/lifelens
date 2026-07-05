import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useUniverse } from '../lib/store'
import { STATUS_META, formatDate } from '../lib/evidence'
import { analyzeRumor } from '../lib/judge'
import { TWEET_LIMIT, composeExplainer } from '../lib/composer'

const SAMPLE =
  'News: xAI announces a new round of funding as Musk deepens the integration between X and xAI following the all-stock acquisition.'

export function ExplainerPage() {
  const { state } = useUniverse()
  const [params] = useSearchParams()
  const [text, setText] = useState(params.get('q') ?? '')
  const [excludedEntities, setExcludedEntities] = useState<Set<string>>(new Set())
  const [excludedEvents, setExcludedEvents] = useState<Set<string>>(new Set())
  const [format, setFormat] = useState<'article' | 'thread'>('article')
  const [copied, setCopied] = useState(false)

  const ready = text.trim().length >= 25
  const analysis = useMemo(() => (ready ? analyzeRumor(state, text) : null), [state, text, ready])

  const explainer = useMemo(() => {
    if (!analysis) return null
    return composeExplainer(state, text, {
      entityIds: analysis.matched.map((e) => e.id).filter((id) => !excludedEntities.has(id)),
      eventIds: analysis.related.map((r) => r.event.id).filter((id) => !excludedEvents.has(id)),
    })
  }, [state, text, analysis, excludedEntities, excludedEvents])

  const toggle = (set: Set<string>, id: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    apply(next)
  }

  const copy = async (payload: string) => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (permissions/http) — user can select the preview text
    }
  }

  return (
    <div>
      <div className="eyebrow">Publishing</div>
      <h1 className="page-title">Explainer Studio</h1>
      <p className="lede">
        A story is out and people are reacting to the headline. Paste it and compose the educational
        deep-dive from the evidence ledger — a cited long-form article, or an X thread with
        receipts. Every sentence comes from accounts already in the universe; contested history
        shows both sides. Curate what to include, then copy and post.
      </p>

      <div className="mt-5 card p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={SAMPLE}
          className="w-full rounded-lg border border-edge bg-surface-2 px-3 py-2 text-sm leading-relaxed text-ink-100 placeholder-ink-600 outline-none focus:border-accent/60"
        />
        {!ready && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span>Paste the news item — the explainer builds as you type.</span>
            <button onClick={() => setText(SAMPLE)} className="text-accent-bright hover:underline">
              Try a sample
            </button>
            <span>
              Judging a rumor instead? Use the{' '}
              <Link to="/rumor-desk" className="text-accent-bright hover:underline">Rumor Desk</Link>.
            </span>
          </div>
        )}
      </div>

      {analysis && explainer && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-5">
            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Background sections
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {analysis.matched.map((e) => {
                  const on = !excludedEntities.has(e.id)
                  return (
                    <button
                      key={e.id}
                      onClick={() => toggle(excludedEntities, e.id, setExcludedEntities)}
                      className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset transition ${
                        on
                          ? 'bg-accent/25 text-ink-50 ring-accent/60'
                          : 'bg-surface-2 text-ink-500 line-through ring-edge'
                      }`}
                    >
                      {e.name}
                    </button>
                  )
                })}
                {analysis.matched.length === 0 && (
                  <p className="text-xs text-ink-500">No known characters detected in the story.</p>
                )}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                History to include
              </h3>
              <ul className="mt-2 space-y-1.5">
                {analysis.related.map((r) => {
                  const on = !excludedEvents.has(r.event.id)
                  return (
                    <li key={r.event.id}>
                      <label className="flex cursor-pointer items-start gap-2 text-xs text-ink-300">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(excludedEvents, r.event.id, setExcludedEvents)}
                          className="mt-0.5 h-3.5 w-3.5 accent-accent"
                        />
                        <span>
                          <span className="font-mono text-ink-500">{formatDate(r.event.date)}</span>{' '}
                          {r.event.title}{' '}
                          <span className={`${STATUS_META[r.status].badge.split(' ')[1]}`}>
                            · {STATUS_META[r.status].label.toLowerCase()}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>

            <p className="text-[11px] leading-relaxed text-ink-600">
              {explainer.sourceOrder.length} sources cited across the draft. Disputed events
              automatically include both sides — leaving them in is usually what makes the piece
              worth reading.
            </p>
          </aside>

          <section>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-full ring-1 ring-inset ring-edge-bright">
                <button
                  onClick={() => setFormat('article')}
                  className={`px-4 py-1.5 text-sm transition ${
                    format === 'article' ? 'bg-surface-3 text-ink-50' : 'text-ink-400 hover:text-ink-100'
                  }`}
                >
                  Cited article
                </button>
                <button
                  onClick={() => setFormat('thread')}
                  className={`px-4 py-1.5 text-sm transition ${
                    format === 'thread' ? 'bg-surface-3 text-ink-50' : 'text-ink-400 hover:text-ink-100'
                  }`}
                >
                  X thread · {explainer.tweets.length} posts
                </button>
              </div>
              <button
                onClick={() =>
                  copy(format === 'article' ? explainer.markdown : explainer.tweets.join('\n\n'))
                }
                className="ml-auto rounded-full bg-accent/90 px-4 py-1.5 text-sm font-semibold text-ink-50 transition hover:bg-accent"
              >
                {copied ? 'Copied ✓' : format === 'article' ? 'Copy markdown' : 'Copy thread'}
              </button>
            </div>

            {format === 'article' ? (
              <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-xl border border-edge bg-canvas/70 p-5">
                <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink-300">
                  {explainer.markdown}
                </pre>
              </div>
            ) : (
              <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {explainer.tweets.map((t, i) => {
                  const over = t.length > TWEET_LIMIT
                  return (
                    <div key={i} className="card p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-100">{t}</p>
                      <div className={`mt-2 text-right text-[11px] ${over ? 'text-status-bad' : 'text-ink-500'}`}>
                        {t.length} / {TWEET_LIMIT}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
