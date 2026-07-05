[docs](../README.md) / [reference](README.md) / file map

# File map

Full source tree with what each file is responsible for. Paths are relative to the repo root.

```
src/
├── types.ts                 All domain types — see concepts/data-model.md
├── App.tsx                  Route table (react-router-dom)
├── main.tsx                 React root mount
├── env.d.ts, vite-env.d.ts  Vite/TS ambient type declarations
│
├── lib/                     Framework-free logic — no React imports except store.tsx
│   ├── store.tsx            UniverseProvider/useUniverse — reducer, actions, localStorage persistence
│   ├── evidence.ts           Source tiers, deriveStatus, STATUS_META/STANCE_META, selectors, formatting
│   ├── mentions.ts           Significance gate: SIGNIFICANCE_THRESHOLD, promotePending, applyMentions
│   ├── extract.ts            LLM (Gemini/OpenAI) + offline heuristic event extraction for /ingest
│   ├── judge.ts              Rumor Desk engine: analyzeRumor, tokens, matchEntities, buildChecklist
│   ├── composer.ts           Explainer Studio: composeExplainer → cited markdown + tweet thread
│   └── decisions.ts          Decision Desk: seekDecision, decisionThread, rationaleGrade
│
├── data/
│   └── seed.ts               The seed UniverseState: entities, sources, events+accounts, decisions, pending
│
├── components/
│   ├── Layout.tsx             App shell: sidebar/mobile nav, stat tiles, reset
│   ├── EventCard.tsx          Status-railed event card, used across most feature pages
│   ├── badges.tsx             StatusBadge, TierBadge, SourceTypeBadge, StanceBadge, EntityChip
│   └── Citations.tsx          CiteMarks, FootnoteList, buildCitationIndex
│
└── pages/
    ├── Universe.tsx           / — constellation map
    ├── Timeline.tsx           /timeline — chronology + density strip
    ├── Characters.tsx         /characters, /characters/:id — index + dossier + Orbit Watch
    ├── Event.tsx              /events/:id — evidence record
    ├── Sources.tsx            /sources — evidence library
    ├── Ingest.tsx             /ingest — 3-step additive ingestion
    ├── RumorDesk.tsx          /rumor-desk
    ├── Explainer.tsx          /explainer
    └── Decisions.tsx          /decisions, /decisions/:id — index/seek/form + dossier

design.md                     Full design system (tokens, components, dataviz specs, a11y)
README.md                     User-facing overview and quick start
docs/                          This documentation tree
```

## Layer boundaries

- **`lib/*`** (except `store.tsx`) is plain TypeScript with no React or DOM dependency — this is
  what makes the [check-suite verification approach](../06-development/verification.md) possible:
  these modules can be bundled and run directly under Node against `data/seed.ts`.
- **`components/*`** are presentational/reusable across pages; none hold their own top-level
  state beyond local UI state (form inputs, hover, open/closed).
- **`pages/*`** own the per-route data flow: reading `useUniverse()`, deriving view state with
  `useMemo`, and dispatching actions.

## One page, multiple routes

Three page files intentionally export more than one route component because their views are
tightly coupled: `Characters.tsx` (`CharactersIndexPage` + `CharacterPage`) and `Decisions.tsx`
(`DecisionsIndexPage` + `DecisionPage`) — see [`App.tsx`](../../src/App.tsx) for the route table.
