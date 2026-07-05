# LifeLens documentation

LifeLens is a cited, additive knowledge base for the Elon Musk / Tesla / SpaceX / xAI universe —
a living biography where every claim traces to a source, contradictions accumulate instead of
overwriting each other, and evidence status is always derived, never asserted. This tree documents
what it is and how it's built, organized as a hierarchy: start at the top and drill down, or jump
straight to the doc you need from the map below.

For the product pitch and quick start, see the repo [`README.md`](../README.md). For the full
visual design system, see [`design.md`](../design.md).

## Map

```
docs/
├── 01-concepts/            The ideas everything else follows from — read first
│   ├── philosophy.md         Why events/accounts/derived-status; why additive; why characters are the frame
│   ├── data-model.md          Every type in src/types.ts, field by field
│   └── evidence-tiers.md      Source tiers, the deriveStatus algorithm, stances
│
├── 02-architecture/        Cross-cutting mechanics every feature builds on
│   ├── state-management.md    The reducer, actions, localStorage persistence & migration
│   ├── significance-gate.md   Orbit watch, the promotion algorithm, dismissal
│   └── extraction-pipeline.md LLM (Gemini/OpenAI) + offline heuristic extraction
│
├── 03-features/            One doc per route
│   ├── universe.md            / — constellation map
│   ├── timeline.md            /timeline — chronology + density strip
│   ├── characters.md          /characters, /characters/:id — dossiers + Orbit Watch
│   ├── events.md              /events/:id — evidence record + EventCard
│   ├── sources.md             /sources — the evidence library
│   ├── ingest.md              /ingest — additive ingestion, 3 steps
│   ├── rumor-desk.md          /rumor-desk — judge a story for trading decisions
│   ├── explainer-studio.md    /explainer — compose a cited article + X thread
│   └── decision-desk.md       /decisions, /decisions/:id — design-pivot dossiers, ask "why" on command
│
├── 04-design-system/       Pointer + quick orientation to /design.md
│
├── 05-reference/           Lookup material
│   ├── file-map.md            Full source tree, what each file owns
│   ├── glossary.md            Every domain term, one line each
│   └── environment-variables.md  The .env keys for LLM-backed extraction
│
└── 06-development/         Running, building, verifying
    ├── getting-started.md     Install, scripts, env setup, the stack
    └── verification.md        How this project actually checks correctness
```

## Suggested reading paths

- **New to the codebase?** [Concepts](01-concepts/README.md) →
  [Architecture](02-architecture/README.md) → [Features](03-features/README.md), in order.
- **Working on one feature?** Jump straight to its doc in
  [03-features](03-features/README.md) — each links back to the concepts/architecture it depends
  on.
- **Just need a fact?** [05-reference](05-reference/README.md) — file map, glossary, env vars.
- **Setting up locally?** [06-development/getting-started.md](06-development/getting-started.md).
- **Changing `src/lib/` logic?** Read [06-development/verification.md](06-development/verification.md)
  first — this project verifies logic changes with esbuild-run check suites against real seed
  data, not a test framework.

## Keeping this tree current

When you add a feature: add one file under `03-features/`, link it from that section's `README.md`
and from this top-level map. When you add a domain concept or type: extend
`01-concepts/data-model.md` (and the [glossary](05-reference/glossary.md) if it introduces new
vocabulary). When you add a `UniverseState` top-level field: update
[state-management.md](02-architecture/state-management.md)'s migration note and the
[data model](01-concepts/data-model.md).
