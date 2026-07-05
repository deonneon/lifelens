import type { Entity } from '../types'

/** A machine-proposed event awaiting human review in the ingest flow. */
export interface CandidateEvent {
  title: string
  date: string
  summary: string
  quote: string
  entityIds: string[]
}

export interface ExtractionResult {
  candidates: CandidateEvent[]
  method: 'gemini' | 'openai' | 'heuristic'
}

const MONTH_PATTERN =
  '(January|February|March|April|May|June|July|August|September|October|November|December)'
const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
}

function matchEntities(sentence: string, entities: Entity[]): string[] {
  const lower = sentence.toLowerCase()
  return entities
    .filter((e) =>
      [e.name, ...e.aliases].some((name) => name && lower.includes(name.toLowerCase())),
    )
    .map((e) => e.id)
}

/** Pull a date out of a sentence: "June 28, 1971" → 1971-06-28, "March 2002" → 2002-03, else bare year. */
function findDate(sentence: string): string | null {
  const full = sentence.match(new RegExp(`${MONTH_PATTERN}\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i'))
  if (full && full[1] && full[2] && full[3]) {
    return `${full[3]}-${MONTHS[full[1].toLowerCase()]}-${full[2].padStart(2, '0')}`
  }
  const monthYear = sentence.match(new RegExp(`${MONTH_PATTERN}\\s+(\\d{4})`, 'i'))
  if (monthYear && monthYear[1] && monthYear[2]) {
    return `${monthYear[2]}-${MONTHS[monthYear[1].toLowerCase()]}`
  }
  const year = sentence.match(/\b(19[5-9]\d|20[0-4]\d)\b/)
  if (year && year[1]) return year[1]
  return null
}

/**
 * No-API fallback: propose one candidate per sentence that contains both a
 * date and a known character. Crude, but it keeps ingestion usable offline.
 */
export function heuristicExtract(text: string, entities: Entity[]): CandidateEvent[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)

  const candidates: CandidateEvent[] = []
  for (const sentence of sentences) {
    const date = findDate(sentence)
    if (!date) continue
    const entityIds = matchEntities(sentence, entities)
    if (entityIds.length === 0) continue
    candidates.push({
      title: sentence.length > 90 ? `${sentence.slice(0, 87)}…` : sentence,
      date,
      summary: sentence,
      quote: sentence,
      entityIds,
    })
  }
  return candidates
}

function buildPrompt(text: string, entities: Entity[]): string {
  const roster = entities.map((e) => `${e.id} (${e.name})`).join(', ')
  return `You are an archivist for a sourced biography of the Elon Musk universe.
Known characters: ${roster}

From the source text below, extract discrete factual events. For each event return:
- "title": short headline
- "date": "YYYY", "YYYY-MM" or "YYYY-MM-DD" (most precise supported by the text)
- "summary": one neutral sentence describing what happened
- "quote": the passage of the source text that asserts it (verbatim or near-verbatim)
- "entityIds": ids from the roster for every character involved

Respond with ONLY a JSON array of these objects. If no dateable events exist, return [].

SOURCE TEXT:
${text}`
}

function parseCandidates(raw: string, entities: Entity[]): CandidateEvent[] {
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []
  const known = new Set(entities.map((e) => e.id))
  const parsed = JSON.parse(jsonMatch[0]) as Partial<CandidateEvent>[]
  return parsed
    .filter((c) => c.title && c.date && c.quote)
    .map((c) => ({
      title: String(c.title),
      date: String(c.date),
      summary: String(c.summary ?? c.title),
      quote: String(c.quote),
      entityIds: (c.entityIds ?? []).filter((id) => known.has(id)),
    }))
}

async function geminiExtract(text: string, entities: Entity[]): Promise<CandidateEvent[]> {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text, entities) }] }],
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`)
  const data = await res.json()
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return parseCandidates(raw, entities)
}

async function openaiExtract(text: string, entities: Entity[]): Promise<CandidateEvent[]> {
  const key = import.meta.env.VITE_LLM_API_KEY
  const url = import.meta.env.VITE_LLM_API_URL || 'https://api.openai.com/v1/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt(text, entities) }],
      temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`LLM API error ${res.status}`)
  const data = await res.json()
  const raw: string = data?.choices?.[0]?.message?.content ?? ''
  return parseCandidates(raw, entities)
}

function hasKey(value: string | undefined): boolean {
  return Boolean(value && !value.startsWith('your_'))
}

/** Try LLM extraction if a key is configured; always fall back to the heuristic. */
export async function extractEvents(text: string, entities: Entity[]): Promise<ExtractionResult> {
  if (hasKey(import.meta.env.VITE_GEMINI_API_KEY)) {
    try {
      const candidates = await geminiExtract(text, entities)
      if (candidates.length > 0) return { candidates, method: 'gemini' }
    } catch {
      // fall through
    }
  }
  if (hasKey(import.meta.env.VITE_LLM_API_KEY)) {
    try {
      const candidates = await openaiExtract(text, entities)
      if (candidates.length > 0) return { candidates, method: 'openai' }
    } catch {
      // fall through
    }
  }
  return { candidates: heuristicExtract(text, entities), method: 'heuristic' }
}
