[docs](../README.md) / [features](README.md) / Universe

# Universe map

**Route:** `/` · **File:** [`src/pages/Universe.tsx`](../../src/pages/Universe.tsx)

The entry point and the answer to "focus on the universe": every character rendered as a node in
an SVG constellation, connected by `relationships`, sized by documented activity.

## Layout

- **Elon Musk** is fixed at the center (`elon-musk` special-cased) — the whole cast orbits him
  because the seed corpus does.
- **Companies** are placed on an inner orbit ring, evenly spaced by angle.
- **People** (excluding the center) are placed on an outer orbit ring, angularly offset so they
  don't align radially with the companies.
- Node radius: `13 + √(eventsForEntity(state, id).length) × 4.5`, capped at 34px — square-root
  scaling keeps a handful of high-activity nodes (Musk, Tesla, SpaceX) from dwarfing everything
  else.
- Edges are drawn once per unique relationship pair (deduplicated by sorted id pair), as a
  quadratic Bézier bowed 12% outward from the straight line, so crossing edges stay legible.

## Interaction

- **Hover** a node: its edges and directly-connected neighbors stay at full opacity; everything
  else dims to 0.25. A dossier popover shows kind, origin, event count, and up to 5 relationships.
- **Click** a node: navigates to `/characters/:id`.
- The center node (Musk) has a decorative `pulse-ring` animation — the one intentionally
  looping ambient motion in the app (see [design system](../04-design-system/README.md)).
- Node labels have a stroked halo (`stroke="#0B0C12" strokeWidth={3.5} paintOrder="stroke"`) so
  text stays readable over crossing edges without a background box.

## Status counts & disputed events

Below the map: a row of status-count chips (linking to `/timeline?status=<status>`) and, if any
pending characters are un-dismissed, an "on orbit watch" chip linking to
`/characters#orbit-watch`. Beneath that, a grid of every currently `disputed` event — the map
doubles as an entry point into the contested parts of the record.

## Data dependencies

- `eventsForEntity`, `statusOf` from [`evidence.ts`](../../src/lib/evidence.ts).
- Reads `state.entities` and each entity's `relationships` directly — no separate "graph" data
  structure; the map is derived fresh from the same `UniverseState` every render.
