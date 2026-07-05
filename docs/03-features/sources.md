[docs](../README.md) / [features](README.md) / Sources

# Source Library

**Route:** `/sources` · **File:** [`src/pages/Sources.tsx`](../../src/pages/Sources.tsx)

The evidence library everything else traces back to.

## Layout

- Sorted by tier ascending, then by publication date — strongest evidence first.
- A reference strip at the top lists every `SourceType` with its tier and a tooltip blurb
  (`SOURCE_TYPE_META`), so the tiering scheme is visible without leaving the page.
- Each source is a collapsible row: `TierBadge`, `SourceTypeBadge`, title, and a summary line
  (author · publisher · date · account count). Expanding shows the outbound URL (if any) and
  every account this source has testified on, each linking to its event with a `StanceBadge`.
- A source with zero accounts shows a note that it isn't attached to any event yet — sources can
  be added independent of any specific event via `/ingest`, then attached later.

## Data dependencies

`accountsForSource`, `formatDate`, `sourceTier` from `evidence.ts`.

## Relationship to ingestion

This page is read-only — sources are created exclusively through
[the Ingest flow](ingest.md) (step 1: source metadata) or, for rumors, through
[the Rumor Desk](rumor-desk.md)'s "Log to watchlist" action, which mints a tier-4 (or
user-chosen-tier) source alongside the logged event.
