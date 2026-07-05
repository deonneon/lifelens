[docs](../README.md) / [concepts](README.md) / evidence tiers

# Evidence tiers & derived status

Source of truth: [`src/lib/evidence.ts`](../../src/lib/evidence.ts).

## Source tiers

Every `SourceType` maps to a tier, 1 (strongest) to 4 (weakest). Lower is stronger — note that
first-hand statements are tier 3, not tier 1: the actors in this universe are, per the app's own
design note, "famously unreliable narrators about themselves."

| Tier | Types | Examples |
|---|---|---|
| **1 · Record** | `official-record` | SEC filings, court complaints, incorporation certificates, NASA contract announcements |
| **2 · Researched** | `reporting`, `biography` | Reuters/Verge/Washington Post reporting; Vance's and Isaacson's biographies |
| **3 · Self-reported** | `analysis`, `autobiography`, `first-hand` | Tweets, blog posts, press releases, the subject's own book, informed commentary |
| **4 · Unverified** | `rumor` | Anonymous sourcing, speculation, unconfirmed reports |

`sourceTier(source)` looks this up from `SOURCE_TYPE_META`. `TIER_LABELS` supplies the short mono
badge text (`T1 · Record`, etc.) used throughout the UI.

## Derived status

An event never stores its own truth-value. `deriveStatus(accounts, sourceById)` computes one of
four `EventStatus` values from the full set of accounts attached to the event, every time it's
read:

```
1. Any account disputes the event?           → 'disputed'
2. All supporting accounts are tier 4?        → 'rumor'
3. A tier-1 account exists, OR
   ≥ 2 distinct non-rumor sources support it? → 'corroborated'
4. Otherwise                                  → 'single-source'
```

Rule order matters: **disputed always wins**, even over a tier-1 supporting account — a
challenged fact is flagged before it's counted as strong. `clarifies` accounts count as
"supporting" for tier/corroboration purposes; they add context without contradicting.

| Status | Meaning | Badge color |
|---|---|---|
| `corroborated` | Backed by an official record, or by ≥2 independent non-rumor sources | `status-good` (green) |
| `single-source` | Exactly one non-rumor source so far | `status-info` (blue) |
| `disputed` | At least one account challenges the event as described | `status-bad` (red) |
| `rumor` | Supported only by unverified (tier-4) sources | `status-warn` (amber) |

`STATUS_META` carries the label, dot/badge Tailwind classes, and a one-line blurb for each status;
it's the single place status semantics are defined, consumed by badges, the event card's status
rail, the timeline's density strip, and the "why this status?" explainer on the event page.

## Selectors

All derived from `UniverseState` — none of these values are stored, all are computed on read:

| Function | Returns |
|---|---|
| `sourceMap(state)` | `Map<sourceId, Source>` |
| `accountsFor(state, eventId)` | every account on an event |
| `statusOf(state, event)` | the event's derived `EventStatus` |
| `eventsForEntity(state, entityId)` | an entity's events, chronological |
| `accountsForSource(state, sourceId)` | every account a source has testified on |

## Stances

`Stance = 'supports' | 'disputes' | 'clarifies'`, with matching `STANCE_META` badges (green /
red / accent). `clarifies` is for accounts that add nuance without contradicting — e.g. Musk's
follow-up blog post explaining the "funding secured" tweet rests on Saudi PIF talks; it doesn't
dispute the tweet, it contextualizes it.

## Formatting helpers

- `formatDate(date)` — `'1971-06-28'` → `'Jun 28, 1971'`; `'1999-02'` → `'Feb 1999'`; `'1995'` →
  `'1995'`. Precision is read from how many date segments are present.
- `yearOf(date)` — first 4 characters; used for timeline grouping and ingest merge-suggestion
  matching.
- `freshId(prefix)` — `${prefix}-${Date.now().toString(36)}-${counter}` for locally-created
  records (events, sources, accounts, decisions).
