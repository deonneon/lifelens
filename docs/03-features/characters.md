[docs](../README.md) / [features](README.md) / Characters

# Characters

**Routes:** `/characters` (index), `/characters/:id` (dossier)
**File:** [`src/pages/Characters.tsx`](../../src/pages/Characters.tsx) (both pages live here)

## Index (`CharactersIndexPage`)

Three sections:

1. **People** — grid of cards (name, origin, documented-event count), sorted by insertion order.
2. **Companies** — same, separate section.
3. **Orbit Watch** (`id="orbit-watch"`, linked from the Universe map and the sidebar) — every
   non-dismissed `PendingCharacter`: a progress bar (`mentionCount / SIGNIFICANCE_THRESHOLD`),
   the list of mentioning events (linked), and **Promote now** / **Dismiss** buttons dispatching
   `promotePending` / `dismissPending`. See
   [the significance gate](../02-architecture/significance-gate.md) for the mechanics behind this
   section.

## Dossier (`CharacterPage`)

A wiki-style page for one entity:

- Kind indicator (`● person` / `■ company`), name, origin.
- **Bio**: each `CitedSegment` rendered as a paragraph with `CiteMarks` superscripts, followed by a
  `FootnoteList` — the numbering (`buildCitationIndex`) is built fresh per-page from the bio
  segments' `sourceIds`, in order of first appearance (see
  [Citations](../../src/components/Citations.tsx)).
- **Activity**: every event the entity participates in (`eventsForEntity`, chronological),
  rendered as `EventCard`s with `hideEntityId` set so the entity's own chip doesn't repeat on
  every card.
- **Sidebar**: relationships (each linking to the target entity's own dossier via `EntityChip`),
  and aliases if any exist.

## Empty states

- No documented events yet → a prompt linking to `/ingest`.
- No mapped relationships yet → a plain text note (relationships are seeded either by hand in
  `seed.ts` or auto-generated on promotion — see the significance gate).

## Data dependencies

`eventsForEntity`, `formatDate`, `sourceMap` from `evidence.ts`; `SIGNIFICANCE_THRESHOLD` from
`mentions.ts`; `CiteMarks`/`FootnoteList`/`buildCitationIndex` from `Citations.tsx`.
