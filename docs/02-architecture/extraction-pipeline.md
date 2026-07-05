[docs](../README.md) / [architecture](README.md) / extraction pipeline

# Extraction pipeline

Source of truth: [`src/lib/extract.ts`](../../src/lib/extract.ts). Turns pasted free text into
candidate events for human review on the [Ingest page](../03-features/ingest.md).

## Entry point

```ts
extractEvents(text: string, entities: Entity[]): Promise<ExtractionResult>
```

Tries providers in order, falling back on failure or missing key, and always succeeds (the
heuristic never throws):

```
1. Gemini    — if VITE_GEMINI_API_KEY is set and doesn't look like a placeholder
2. OpenAI    — if VITE_LLM_API_KEY is set (same check)
3. Heuristic — always available, zero dependencies, runs fully offline
```

`ExtractionResult.method` (`'gemini' | 'openai' | 'heuristic'`) is surfaced in the ingest UI so
it's clear which path produced the candidates.

## Candidate shape

```ts
interface CandidateEvent {
  title: string
  date: string        // 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD'
  summary: string
  quote: string        // the source passage that asserts it
  entityIds: string[]  // known characters involved
  newEntities: DetectedName[]  // { name, kind } — unknown names, candidates for the orbit watch
}
```

## LLM path

`buildPrompt(text, entities)` sends the known-entity roster plus the pasted text and asks for a
JSON array of events, each with `title`/`date`/`summary`/`quote`/`entityIds`/`newEntities`. The
prompt explicitly instructs the model to only name **actors** in `newEntities` — "never places,
products or incidental mentions" — pushing the significance judgment upstream into the extraction
step itself, before the [significance gate](significance-gate.md) even sees the name.

`parseCandidates(raw, entities)` is defensive: it regex-extracts the first `[...]` block (models
wrap JSON in prose despite instructions), filters to entries with a `title`/`date`/`quote`, and
filters `entityIds` down to ids that actually exist in the roster (a hallucinated id is silently
dropped, not surfaced as an error).

Two providers are wired, both plain `fetch`, no SDK dependency:

| Provider | Env keys | Default model/endpoint |
|---|---|---|
| Gemini | `VITE_GEMINI_API_KEY`, `VITE_GEMINI_MODEL` | `gemini-1.5-flash` via `generativelanguage.googleapis.com` |
| OpenAI-compatible | `VITE_LLM_API_KEY`, `VITE_LLM_API_URL` | `gpt-4o-mini` via `api.openai.com/v1/chat/completions` |

See [environment variables](../05-reference/environment-variables.md) for the full list.

## Heuristic fallback (no API key required)

`heuristicExtract(text, entities)` — crude but keeps the app fully usable offline:

1. Split `text` into sentences (`.!?` boundaries, ≥20 chars).
2. For each sentence, try to find a date (`findDate`): full `Month D, YYYY` → `YYYY-MM-DD`,
   `Month YYYY` → `YYYY-MM`, or a bare 4-digit year in `1950–2049` → `YYYY`.
3. Skip sentences with no date, or no known-entity match (`matchEntities`, a case-insensitive
   substring match against every entity's name and aliases).
4. Every remaining sentence becomes one candidate: `title` = the sentence (truncated to 90 chars
   with an ellipsis), `summary`/`quote` = the full sentence.
5. Run `detectNewNames` on the sentence for unknown-name detection (see below).

## New-name detection

`detectNewNames(sentence, entities)` regex-matches capitalized multi-word sequences
(`/\b[A-Z][A-Za-z&'.]+(?:\s+[A-Z][A-Za-z&'.]+)+\b/g`), then filters out:

- Names already known (case-insensitive match against every entity's name/aliases, including
  substring containment either direction — so "Elon Musk" doesn't get re-flagged from "Elon Musk
  Jr." style variants).
- Entries in `NAME_STOPLIST` — a fixed list of places and product names that match the
  capitalized-multi-word pattern but aren't actors (`"South Africa"`, `"Model S"`, `"Series A"`,
  `"Cape Canaveral"`, …). **When new seed/ingest text introduces a new place or product name that
  gets mistakenly flagged as a person, add it here rather than working around it downstream.**

Surviving names get a `kind` guess from `COMPANY_SUFFIX` — a regex for endings like `Inc`, `Corp`,
`Motors`, `Technologies`, `Capital`, `Labs` — defaulting to `'person'` otherwise.

## Where candidates go next

Candidates are not committed automatically. The [Ingest page](../03-features/ingest.md) renders
each as an editable row (date/title/entities all adjustable, new names as track/ignore chips) and
only on explicit commit does it dispatch `ADD_EVENT`/`ADD_ACCOUNT` (or merge into an existing
event) plus `RECORD_MENTIONS` for tracked new names — see
[the significance gate](significance-gate.md) for what happens to those from there.
