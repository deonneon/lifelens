[docs](../README.md) / [features](README.md) / Timeline

# Master Timeline

**Route:** `/timeline` · **File:** [`src/pages/Timeline.tsx`](../../src/pages/Timeline.tsx)

The master chronology — every event across every character, filterable down to "pinpoint any
activity by any character."

## Filters

State lives in the URL (`useSearchParams`), so filtered views are shareable/bookmarkable:

| Param | Filters on |
|---|---|
| `entity` | one character's `participants` |
| `status` | derived `EventStatus` (`statusOf`) |
| `sourceType` | any account's source `type` |
| (local `query` state, not in URL) | free-text match against title/summary/tags |

Clicking an already-active filter chip clears it (toggle behavior via `setParam`).

## Activity density strip

A per-year stacked bar chart above the chronological list — see the
[dataviz spec](../04-design-system/README.md#activity-density-strip) for the full visual
rationale. Mechanically:

1. Group filtered events by `yearOf(event.date)`.
2. For each year, count events per status in a **fixed stack order** —
   `['corroborated', 'single-source', 'disputed', 'rumor']` — never re-ordered by count, so a
   status always occupies the same visual band across years.
3. Bar segment height is proportional to count relative to the single busiest year
   (`Math.max(1, ...counts)`), with a 6px floor so single-event segments stay visible; 2px gaps
   between segments.
4. **Hover** shows a native tooltip with the full year breakdown. **Click** smooth-scrolls to that
   year's section (`document.getElementById('year-${year}')`).
5. The strip reflects whatever filters are active — filter to one character and it becomes that
   character's personal activity profile.

## Chronological list

Grouped by year, each section anchored (`id="year-${year}"`, `scroll-mt-24` so the sticky header
doesn't cover it on jump), rendered as a two-column grid of `EventCard`s (see
[Events](events.md) for the card itself).

## Data dependencies

`accountsFor`, `sourceMap`, `statusOf`, `yearOf` from [`evidence.ts`](../../src/lib/evidence.ts).
