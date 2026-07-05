[docs](../README.md) / [features](README.md) / Events

# Events

**Route:** `/events/:id` · **File:** [`src/pages/Event.tsx`](../../src/pages/Event.tsx)
**Related component:** [`src/components/EventCard.tsx`](../../src/components/EventCard.tsx) — the
compact card used everywhere an event is listed (Timeline, character/decision dossiers, Rumor
Desk related-events, Universe disputed grid).

## The event page

The full evidence record for one event:

1. Date, location, derived `StatusBadge`, title, summary, participant chips (with role), tags.
2. **"Why `{status}`?"** explainer card — a plain-language readout of `STATUS_META[status].blurb`
   plus the live account/source count, making clear the status recomputes automatically as
   accounts are added.
3. **Accounts grouped by stance** — Supporting, Disputing, Clarifying (in that order; a group is
   skipped entirely if empty), each account rendered with its source's `TierBadge` and
   `SourceTypeBadge`, the quote (stripped of pre-existing smart-quote characters via a local
   `cleanQuote` helper so quotes aren't visually doubled), and attribution with an optional
   locator and outbound link.
4. **Add an account** — an inline form (source picker, stance picker, quote textarea, optional
   locator) that dispatches `addAccount` with a fresh id. This is the primary way a *new*
   account attaches to an *existing* event outside of the ingest flow — e.g. logging a
   confirmation or denial as a rumor develops.

## `EventCard`

Used in every list-of-events context. Structural anatomy:

- A 3px **status rail** on the left edge (`STATUS_META[status].dot`) — evidence state is legible
  before any text is read (see [design system](../04-design-system/README.md)).
- Mono date, `StatusBadge`, and a right-aligned source/dispute count.
- Fraunces title, two-line-clamped summary, participant chips (`hideEntityId` prop lets a
  character's own dossier suppress its own chip).

## Data dependencies

`STATUS_META`, `STANCE_META`, `accountsFor`, `formatDate`, `freshId`, `sourceMap`, `statusOf` from
`evidence.ts`; badges from `src/components/badges.tsx`.
