[docs](../README.md) / features

# Features

One document per route. Each covers purpose, the user story it answers (where there is one), file
locations, data flow, and key behaviors/edge cases.

| Route | Doc | Purpose |
|---|---|---|
| `/` | [universe.md](universe.md) | Constellation map of every character — the entry point |
| `/timeline` | [timeline.md](timeline.md) | Master chronology with filters and an activity density strip |
| `/characters`, `/characters/:id` | [characters.md](characters.md) | Wiki dossiers + the Orbit Watch (significance gate UI) |
| `/events/:id` | [events.md](events.md) | Full evidence record for one event; the `EventCard` component |
| `/sources` | [sources.md](sources.md) | The evidence library, tiered |
| `/ingest` | [ingest.md](ingest.md) | Additive ingestion: paste text → review candidates → commit |
| `/rumor-desk` | [rumor-desk.md](rumor-desk.md) | Judge a breaking story against the corpus, for trading decisions |
| `/explainer` | [explainer-studio.md](explainer-studio.md) | Compose a cited article + X thread from the ledger |
| `/decisions`, `/decisions/:id` | [decision-desk.md](decision-desk.md) | Design/strategy pivot dossiers; ask "why" on command |

## Shared building blocks

Not routes, but used across several of the above:

| File | Used by |
|---|---|
| [`src/components/EventCard.tsx`](../../src/components/EventCard.tsx) | Timeline, Characters, Universe, Rumor Desk, Decision Desk |
| [`src/components/badges.tsx`](../../src/components/badges.tsx) | Nearly every page — `StatusBadge`, `TierBadge`, `SourceTypeBadge`, `StanceBadge`, `EntityChip` |
| [`src/components/Citations.tsx`](../../src/components/Citations.tsx) | Characters, Decision Desk — `CiteMarks`, `FootnoteList`, `buildCitationIndex` |
| [`src/components/Layout.tsx`](../../src/components/Layout.tsx) | The app shell: sidebar/mobile nav, corpus stat tiles, reset |

Previous: [← Architecture](../02-architecture/README.md) · Next: [Design System →](../04-design-system/README.md)
