[docs](../README.md) / [features](README.md) / Decision Desk

# Decision Desk

**Routes:** `/decisions` (index + seek + thread-creation), `/decisions/:id` (dossier)
**Page:** [`src/pages/Decisions.tsx`](../../src/pages/Decisions.tsx)
**Logic:** [`src/lib/decisions.ts`](../../src/lib/decisions.ts)

## User story

*"When there's a certain design choice, pull the history and rationale around it — e.g. Tesla
revamping FSD from millions of lines of code to an end-to-end neural network, or SpaceX switching
the rocket body material to stainless steel. Support asking about it on command."*

A design/strategy pivot is a different shape from a plain event: it's a **from → to** replacement
with alternatives that were weighed and a rationale that can itself be strong or weak evidence.
The Decision Desk gives that shape its own record type (`Decision` — see
[data model](../01-concepts/data-model.md#decision)) instead of forcing it into an ordinary
event.

## Anatomy of a decision dossier

| Section | Content |
|---|---|
| From → To | Neutral chip for the prior approach, accent chip for the chosen one |
| Options weighed | Every alternative considered, each tagged `chosen` / `rejected` / `superseded`, with a cited note |
| Why the change was made | `rationale: CitedSegment[]` — cited prose, same citation system as entity bios |
| Counterpoints & risks | `counterpoints: CitedSegment[]` — the other side of the pivot, cited the same way |
| The thread | The chronological run of `UniverseEvent`s around the pivot (`decisionThread`), each an `EventCard` with its own derived status |
| Related decisions | Cross-links via `relatedDecisionIds` (e.g. Tesla Vision ↔ the FSD end-to-end rewrite — the radar removal is a precursor to the later full neural rewrite) |

Each dossier also shows a **rationale grade** — `rationaleGrade(state, decision)` returns the
strongest source tier cited across rationale+counterpoints plus the distinct source count (e.g.
`T2 · Researched · 4 sources`), so the evidence strength behind the "why" is visible before
reading a word of it. This reuses the same tier system as event status — see
[evidence tiers](../01-concepts/evidence-tiers.md).

## Ask on command — `seekDecision(state, query)`

The seek box takes a plain question and returns one of two shapes:

```ts
type SeekResult =
  | { kind: 'decisions'; matches: DecisionMatch[] }   // ranked dossiers
  | { kind: 'brief'; brief: ResearchBrief }            // nothing on file — here's what to find
```

**Matching** builds a token bag per decision (title, question, from/to, domain, tags, option
labels/notes, rationale, counterpoints) and scores query overlap against it. Two exclusions keep
matching honest rather than trivially permissive:

- **Character names are excluded from the query's subject tokens** — but only names of entities
  actually detected *in that query* (not the whole roster), so an ordinary word that happens to be
  part of some other entity's alias (e.g. "network," a token in Zip2's old corporate name) is
  never wrongly excluded.
- **Question scaffolding is excluded** (`why`, `did`, `how`, `decision`, `choice`, …) — every
  decision's `question` field contains this vocabulary, so it can never distinguish one decision
  from another and would otherwise let *any* "why did…" question soft-match *every* thread.

A match requires at least `MATCH_FLOOR` (2) surviving subject-token hits. Below that, or with zero
threads scoring, `seekDecision` returns a **research brief** instead of forcing a bad match.

### The research brief

When nothing on file answers the question, `buildBrief` reuses the Rumor Desk's relatedness engine
(`analyzeRumor` from `judge.ts` — see [Rumor Desk](rumor-desk.md)) to surface:

- Characters detected in the question.
- Up to 5 adjacent events already in the ledger (with derived status), so you can see what *is*
  documented even though the specific pivot isn't.
- A fixed list of **where to look next**: design presentations/interviews, earnings-call Q&A,
  patent/regulatory filings, independent teardowns — plus a prompt to ingest what you find and
  start the thread.

This is the same principle as [additive ingestion](../01-concepts/philosophy.md): the app never
fakes an answer it doesn't have evidence for. It tells you exactly what evidence would resolve the
gap.

## Starting a thread

The index page's "+ Start a decision thread" form captures the minimum viable dossier: title,
question, from/to, decided date, domain, involved characters, an optional first cited rationale
segment, and linked events (searched by title). `addDecision` dispatches `ADD_DECISION`; the
dossier then grows over time as more rationale/counterpoint segments and events are added (a UI
for that incremental growth is a natural next step — see the note in the file map).

## Seed data

Three real, cited pivots ship in `src/data/seed.ts`:

| Decision | From → To |
|---|---|
| `dec-starship-steel` | Carbon-fiber composite airframe → cold-rolled 301 stainless steel |
| `dec-tesla-vision` | Camera + radar sensor fusion → vision-only neural-network perception |
| `dec-fsd-e2e` | ~300k lines of hand-coded C++ planning/control → end-to-end neural network |

`dec-tesla-vision` and `dec-fsd-e2e` cross-link via `relatedDecisionIds` — radar removal set up the
vision-only bet that the later end-to-end rewrite completed.

## Data dependencies

`analyzeRumor`, `matchEntities`, `tokens` (exported from `judge.ts` for reuse here); `sourceMap`,
`sourceTier`, `statusOf` from `evidence.ts`.
