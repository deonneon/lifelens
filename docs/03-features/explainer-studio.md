[docs](../README.md) / [features](README.md) / Explainer Studio

# Explainer Studio

**Route:** `/explainer` · **Page:** [`src/pages/Explainer.tsx`](../../src/pages/Explainer.tsx)
**Logic:** [`src/lib/composer.ts`](../../src/lib/composer.ts)

## User story

*"When there's a news story, write a detailed article explaining it — an educational dissertation
to post on Twitter/X."* The studio composes that explainer directly from the evidence ledger:
**assembly, not generation** — every sentence in the output already existed as cited prose or a
cited account before this page touched it, so the output's credibility is exactly the ledger's
credibility.

## Pipeline

1. Paste the news text. `analyzeRumor(state, text)` (the same function the Rumor Desk uses — see
   [Rumor Desk](rumor-desk.md)) finds matched characters and related events.
2. `defaultSelection(analysis)` pre-selects everything matched; the sidebar lets you toggle
   individual characters and events out (`excludedEntities`/`excludedEvents` sets) before
   composing.
3. `composeExplainer(state, newsText, selection)` builds the output. Nothing here calls an LLM —
   the "composition" is string assembly over already-cited material.

## Citation numbering

A local `cite(sourceIds)` closure assigns `[n]` numbers in order of first appearance across the
whole document and accumulates `sourceOrder` — the same numbering scheme powers both the
markdown's inline marks and its trailing numbered source list, and is returned separately
(`Explainer.sourceOrder`) for the UI to report a source count.

## Cited article (markdown)

Sections assembled in order, each skipped entirely if it would be empty:

1. **Headline quote** — the pasted text, truncated, as a blockquote.
2. **The players** — each selected entity's full cited `bio`, verbatim, with citation marks.
3. **The history you need** — selected related events, chronological, one line each: date, title,
   summary, citations to every non-disputing account, and an italic status label.
4. **Contested ground** — only events with derived status `disputed`; every account (support,
   dispute, clarify) quoted with its stance label, so both sides are read together rather than
   the reader having to reconstruct the disagreement from separate sections.
5. **Track records worth knowing** — for selected entities with actual dispute history on
   first-hand claims (from `analysis.actorRecords`), one line per entity.
6. **Sources** — the numbered footnote list, in citation order.

## X/Twitter thread

The same material, re-chunked into numbered posts ≤ `TWEET_LIMIT` (280) characters:

1. Hook post: the (truncated) headline plus a 🧵 marker.
2. Players post, if any (name + truncated origin, joined by `·`).
3. One post per included event: date stamp, truncated title+summary, and a trailing
   `(src: {shortSourceLabel})` — never a bare `[n]` mark, since a thread reader can't hover a
   footnote. If the event is disputed, an **additional** post immediately follows:
   `⚠️ But this is disputed: "{counter-quote}" — {source}`.
4. One post per entity with a notable dispute track record.
5. A closing post citing the total source count.

`truncate(text, max)` always cuts on a word boundary (falls back to a hard cut only if no space
exists past 60% of the budget), so posts never end mid-word. Each provider's exact character
budget accounts for the `"{i}/{total} "` prefix and any trailing source tag before truncating the
body, which is why several call sites compute a `room` value rather than truncating to a flat
constant.

## Data dependencies

`STATUS_META`, `formatDate`, `accountsFor`, `sourceMap` from `evidence.ts`; `analyzeRumor` from
`judge.ts`.
