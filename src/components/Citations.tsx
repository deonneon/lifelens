import type { Source } from '../types'
import { SOURCE_TYPE_META, formatDate } from '../lib/evidence'

/**
 * Superscript citation marks with hover popovers, wiki-style.
 * `numbers` maps each sourceId to its footnote number on the page.
 */
export function CiteMarks({
  sourceIds,
  numbers,
  sourceById,
}: {
  sourceIds: string[]
  numbers: Map<string, number>
  sourceById: Map<string, Source>
}) {
  return (
    <sup className="ml-0.5 select-none">
      {sourceIds.map((id) => {
        const source = sourceById.get(id)
        const n = numbers.get(id)
        if (!source || !n) return null
        return (
          <span key={id} className="group relative mr-0.5 cursor-help text-[10px] font-semibold text-sky-400">
            [{n}]
            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-900/95 p-3 text-left shadow-xl backdrop-blur group-hover:block">
              <span className="block text-xs font-semibold normal-case text-slate-100">{source.title}</span>
              <span className="mt-1 block text-[11px] font-normal text-slate-400">
                {SOURCE_TYPE_META[source.type].label}
                {source.author ? ` · ${source.author}` : ''}
                {source.publisher ? ` · ${source.publisher}` : ''}
                {source.date ? ` · ${formatDate(source.date)}` : ''}
              </span>
            </span>
          </span>
        )
      })}
    </sup>
  )
}

/** Numbered footnote list to pair with CiteMarks. */
export function FootnoteList({
  orderedSourceIds,
  sourceById,
}: {
  orderedSourceIds: string[]
  sourceById: Map<string, Source>
}) {
  if (orderedSourceIds.length === 0) return null
  return (
    <ol className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-slate-400">
      {orderedSourceIds.map((id, i) => {
        const source = sourceById.get(id)
        if (!source) return null
        return (
          <li key={id} className="flex gap-2">
            <span className="font-semibold text-sky-400">[{i + 1}]</span>
            <span>
              {source.title}
              <span className="text-slate-500">
                {' — '}
                {SOURCE_TYPE_META[source.type].label}
                {source.publisher ? `, ${source.publisher}` : ''}
                {source.date ? `, ${formatDate(source.date)}` : ''}
              </span>
              {source.url && (
                <>
                  {' '}
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                    link ↗
                  </a>
                </>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Build the footnote numbering for a page from segments' sourceIds, in order of first appearance. */
export function buildCitationIndex(segmentSourceIds: string[][]): {
  numbers: Map<string, number>
  ordered: string[]
} {
  const ordered: string[] = []
  const numbers = new Map<string, number>()
  for (const ids of segmentSourceIds) {
    for (const id of ids) {
      if (!numbers.has(id)) {
        ordered.push(id)
        numbers.set(id, ordered.length)
      }
    }
  }
  return { numbers, ordered }
}
