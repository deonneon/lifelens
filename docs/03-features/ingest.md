[docs](../README.md) / [features](README.md) / Ingest

# Ingest

**Route:** `/ingest` · **File:** [`src/pages/Ingest.tsx`](../../src/pages/Ingest.tsx)

The only way new sources enter the corpus (aside from the Rumor Desk's own logging action). A
three-step flow, all on one page:

## 1 · Describe the source

A form for `Source` metadata: title (required), kind (`SourceType` dropdown, tier shown inline),
publication date, author, publisher, URL.

## 2 · Paste the text

A textarea plus **Extract events**, which calls
`extractEvents(text, state.entities)` — see [the extraction pipeline](../02-architecture/extraction-pipeline.md)
for what happens here (LLM if a key is configured, otherwise the offline heuristic). The method
used (`gemini` / `openai` / `heuristic`) is shown as a badge once results return, so it's always
clear which path produced the candidates.

## 3 · Review proposed events

Each `CandidateEvent` becomes an editable review row (`ReviewRow`):

- **Include** checkbox (unchecked rows are skipped on commit, dimmed in the UI).
- Editable date and title fields.
- The extracted quote, shown with smart-quote characters stripped (`cleanQuote`) so the app's own
  quote-wrapping doesn't double them.
- **Entity chips** — toggle which known characters this event involves.
- **New-name chips** — for any `newEntities` the extractor flagged: a track/ignore toggle (only
  "tracked" names are passed to `recordMentions` on commit — see
  [the significance gate](../02-architecture/significance-gate.md)) plus a person/company kind
  toggle, since the extractor's guess can be wrong.
- **Merge-or-create select** — `""` creates a brand-new event; otherwise the row merges as a new
  **account** onto an existing event, with a stance picker (`supports`/`disputes`/`clarifies`).
  The select is pre-populated with `suggestions(row)`: existing events within ±1 year sharing at
  least one entity with the candidate — a heuristic to surface likely merge targets, not an
  automatic merge.

## Commit

One click:

1. Mints one new `Source` from the step-1 metadata (`ADD_SOURCE`).
2. For every included row: either `ADD_ACCOUNT` onto the chosen existing event, or `ADD_EVENT`
   (new event + its first account, tagged `'ingested'`).
3. Collects every *tracked* new-name across all rows into one `RECORD_MENTIONS` dispatch.
4. Navigates to `/timeline`.

This is the concrete implementation of
["additive ingestion"](../01-concepts/philosophy.md#3-additive-ingestion--never-overwrite): the
only two effects are "append a source/event/account" and "record a mention" — there is no update
or delete path here.

## Alternative entry points

The page footer notes that testimony can also be attached directly from an event's own page (its
"Add an account" form) if you already know which existing event a new source speaks to — see
[Events](events.md).
