[docs](../README.md) / [architecture](README.md) / significance gate

# The significance gate

Source of truth: [`src/lib/mentions.ts`](../../src/lib/mentions.ts). Answers the constraint:
*"entity extraction should only happen if the character becomes a critical or significant part of
the story."*

## Why it exists

Ingesting real prose surfaces a lot of proper names — a lawyer mentioned once, a reporter quoted
in passing. Turning every one into a full `Entity` would flood the
[Universe map](../03-features/universe.md) with walk-on parts and make "focus on the universe"
meaningless. So a name has to *earn* a place.

## The mechanism

```
SIGNIFICANCE_THRESHOLD = 3
```

1. During ingestion, [`extract.ts`](../../src/lib/extract.ts)'s `detectNewNames` flags capitalized
   multi-word names not already in the entity roster (see
   [extraction pipeline](extraction-pipeline.md)).
2. Each flagged name becomes (or adds a sighting to) a `PendingCharacter` — an id (slugified name),
   a `kindGuess`, and a growing `mentions: { eventId, sourceId }[]` list.
3. `isSignificant(p)` checks whether the **distinct event count** across `p.mentions` has reached
   `SIGNIFICANCE_THRESHOLD` (3). Repeated mentions of the same event don't count twice.
4. `applyMentions(state, mentions)` — called on every commit from `/ingest` — records each new
   sighting, then does one auto-promotion pass: every non-dismissed pending character that is now
   significant gets `promotePending()`'d automatically, in the same dispatch.
5. A human can also promote (or dismiss) early from the **Orbit Watch** section of
   `/characters#orbit-watch`, regardless of the count.

## Promotion — `promotePending(state, pendingId)`

Converting a `PendingCharacter` into a full `Entity` is designed to be **lossless**: nothing about
the accumulated mentions is discarded.

1. Collect every distinct `eventId` and `sourceId` from the pending record's mentions.
2. If a matching `Entity` already exists (by exact name/alias match — this handles the case where
   the same person was independently promoted or already existed), reuse its id; otherwise mint a
   new `Entity`:
   - `bio`: one auto-generated `CitedSegment` — *"`{name}` was promoted into the universe after
     appearing in `{n}` documented events…"* — cited to every source that mentioned them. This bio
     is a placeholder; it grows with real prose as more sources are ingested.
   - `relationships`: seeded from **co-occurrence** — every other entity appearing in any of the
     same mentioning events is ranked by shared-event count, and the **top 2** become
     `{ targetId, label: 'appears alongside' }` relationships.
3. Every mentioning event gets the new entity added to its `participants` list with
   `role: 'mentioned'` (via `withParticipant`, which is idempotent — it no-ops if already present).
4. The pending record is removed from `state.pending`.

## Dismissal

`DISMISS_PENDING` sets `dismissed: true` on the pending record. A dismissed name:
- Is excluded from the "watching" list shown on the Orbit Watch UI.
- Is excluded from the auto-promotion pass in `applyMentions`.
- **Is un-dismissed automatically** if it's mentioned again later (`applyMentions` clears
  `dismissed: false` when recording a fresh sighting for an existing pending id) — a name you
  dismissed once isn't permanently blocked if it turns out to matter after all.

## Seed state

The seed ships two names sitting on the watch list, deliberately short of the threshold so the
UI's "N/3" progress state is visible out of the box: **Peter Thiel** (2/3 — X.com ouster, PayPal/eBay
sale) and **Kimbal Musk** (2/3 — Zip2 founding, Zip2 sale).

## Where it's surfaced

- `/characters#orbit-watch` — progress bars, mentioning-event links, Promote/Dismiss buttons.
- `/ingest` step 3 — unknown names detected in the pasted text appear as track/ignore chips (with
  a person/company toggle) alongside each candidate event; only "tracked" ones get passed to
  `RECORD_MENTIONS` on commit.
