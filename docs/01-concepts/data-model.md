[docs](../README.md) / [concepts](README.md) / data model

# Data model

Source of truth: [`src/types.ts`](../../src/types.ts). Everything the app stores lives in one
`UniverseState` object, persisted whole to `localStorage` under `lifelens.universe.v1` (see
[state management](../02-architecture/state-management.md)).

```
UniverseState
├── entities:  Entity[]            — the cast: people and companies
├── sources:   Source[]            — the evidence library
├── events:    UniverseEvent[]     — atomic, dated things that happened
├── accounts:  Account[]           — one source's stance on one event
├── pending:   PendingCharacter[]  — names not yet significant enough to be entities
└── decisions: Decision[]          — design/strategy pivot dossiers
```

## Entity

A character — person or company.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | slug, e.g. `elon-musk`, `spacex` |
| `kind` | `'person' \| 'company'` | drives icon (● / ■), color, and map node shape |
| `name` | `string` | canonical display name |
| `aliases` | `string[]` | alternate names/handles matched during extraction and search (`@elonmusk`, `Tesla Motors`, `TSLA`) |
| `origin` | `string?` | one-line origin string, e.g. `"b. June 28, 1971 — Pretoria, South Africa"` |
| `bio` | `CitedSegment[]` | the wiki-style biography, one paragraph per segment, each independently cited |
| `relationships` | `Relationship[]` | `{ targetId, label }` — edges drawn on the [Universe map](../03-features/universe.md) |

## CitedSegment

The unit of citable prose, reused everywhere narrative text appears (entity bios, decision
rationale/counterpoints):

```ts
interface CitedSegment {
  text: string
  sourceIds: string[]
}
```

Rendered via `CiteMarks` (superscript `[n]` marks with hover popovers) and `FootnoteList` (the
numbered source list at the bottom of the page) — see
[`src/components/Citations.tsx`](../../src/components/Citations.tsx).

## Source

A piece of evidence. Its `type` determines its **tier** — see
[evidence tiers](evidence-tiers.md).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `type` | `SourceType` | `official-record \| reporting \| biography \| autobiography \| first-hand \| analysis \| rumor` |
| `title` | `string` | |
| `author` | `string?` | |
| `publisher` | `string?` | |
| `date` | `string?` | publication date, same precision rules as event dates |
| `url` | `string?` | |

## Account

One source's testimony about one event — the atom that makes the "wrong news" problem tractable.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `eventId` | `string` | |
| `sourceId` | `string` | |
| `stance` | `Stance` | `supports \| disputes \| clarifies` |
| `quote` | `string` | the actual testimony — a verbatim or near-verbatim quote |
| `locator` | `string?` | page, chapter, paragraph, URL fragment, exhibit number |

Accounts are **never edited or removed** by the app's normal flows; an event's evidence status is
recomputed from the full, ever-growing set of its accounts (`deriveStatus`, see
[evidence tiers](evidence-tiers.md)).

## UniverseEvent

The atomic unit of history.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `date` | `string` | `'YYYY'` \| `'YYYY-MM'` \| `'YYYY-MM-DD'` — precision is implied by string length |
| `title` | `string` | |
| `summary` | `string` | one neutral sentence |
| `location` | `string?` | |
| `participants` | `Participant[]` | `{ entityId, role }` — every character involved and how |
| `tags` | `string[]` | free-form; special tags: `'ingested'` (created via `/ingest`), `'rumor-watch'` (created via the Rumor Desk) |

An event's truth-status is never stored — it's derived on read from its accounts. See
`statusOf` / `deriveStatus` in [state management](../02-architecture/state-management.md).

## PendingCharacter

A name detected during ingestion that isn't a character yet — see
[the significance gate](../02-architecture/significance-gate.md).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | slugified name |
| `name` | `string` | |
| `kindGuess` | `EntityKind` | guessed from a company-suffix regex during extraction |
| `mentions` | `PendingMention[]` | `{ eventId, sourceId }[]` — every sighting |
| `dismissed` | `boolean?` | set by "Dismiss" on the Orbit Watch; stops auto-promotion |

## Decision

A design or strategy pivot thread — see [the Decision Desk](../03-features/decision-desk.md).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `title` | `string` | e.g. `"Starship airframe: carbon fiber → 301 stainless steel"` |
| `question` | `string` | the question this dossier answers |
| `domain` | `string` | free-form tag: `engineering`, `strategy`, `product`, … |
| `from` / `to` | `string` | the prior approach / the chosen approach |
| `decidedDate` | `string` | same precision rules as event dates |
| `participants` | `Participant[]` | characters involved |
| `options` | `DecisionOption[]` | `{ label, outcome: 'chosen'\|'rejected'\|'superseded', note?, sourceIds? }` |
| `rationale` | `CitedSegment[]` | why the change was made |
| `counterpoints` | `CitedSegment[]` | risks, criticisms, costs — the other side of the pivot |
| `eventIds` | `string[]` | the chronological thread of events around the pivot |
| `relatedDecisionIds` | `string[]?` | cross-links to other decision threads |
| `tags` | `string[]` | |

## Referential integrity

Nothing in this schema uses foreign-key enforcement — `entityId`, `sourceId`, and `eventId`
references are plain strings, validated only by the UI (selectors filter out dangling references)
and by the seed-data check suite (see [verification](../06-development/verification.md)). When
writing new seed data or a migration, keep every reference resolvable.
