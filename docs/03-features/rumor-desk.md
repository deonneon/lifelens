[docs](../README.md) / [features](README.md) / Rumor Desk

# Rumor Desk

**Route:** `/rumor-desk` · **Page:** [`src/pages/RumorDesk.tsx`](../../src/pages/RumorDesk.tsx)
**Logic:** [`src/lib/judge.ts`](../../src/lib/judge.ts)

## User story

*"When a rumor story comes out, use this app to inject context and make a good judgment of the
rumor — support or dispute it — for trading decisions."* The desk never issues a verdict; it
assembles everything the corpus already knows so the judgment call stays informed and stays
yours.

## `analyzeRumor(state, text)`

Given free text (a headline, a tweet, a paragraph), returns a `RumorAnalysis`:

| Field | How it's built |
|---|---|
| `matched` | Entities whose name or any alias appears (case-insensitive substring) in the text |
| `related` | Events ranked by `sharedEntityIds.length × 3 + keyword overlap`, filtered to score ≥ 2 or ≥1 shared entity, top 8 |
| `actorRecords` | Per matched entity: how many of their events rest on a *first-hand/autobiography* supporting account, and how many of those ended up `disputed` |
| `baseRate` | Across the whole corpus: how many events ever carried a tier-4 (rumor) account, and how those resolved (corroborated / disputed / still open) |
| `anchors` | Tier-1 (official-record) account quotes on the related events — "the hardest evidence in the vicinity" |
| `checklist` | Claim-type-specific filing/verification steps (see below) |

### Tokenization

`tokens(text)` lowercases, strips non-alphanumeric (keeping `$`), splits on whitespace, and drops
stopwords and anything under 3 characters. The 3-character floor is intentional — dropping it to
`> 3` (an earlier bug) silently discarded `CEO`, `IPO`, `SEC`, which broke matching on exactly the
claim types the checklist cares about most.

### The filing checklist — `buildChecklist(text, matched)`

Regex-driven, claim-type aware. Each pattern that matches the rumor text appends one concrete,
checkable step:

| Rumor pattern | Checklist item |
|---|---|
| acquisition/merger/buyout language | Watch EDGAR for an 8-K, SC 13D, or merger agreement within 1–2 trading days |
| CEO/chairman/resignation/board language | Officer/director changes at public companies require a Form 8-K (Item 5.02) |
| earnings/revenue/deliveries language | Check the last 10-Q/10-K and the IR page before believing derived numbers |
| IPO/going-public language | Nothing is real until an S-1 (or F-1) hits EDGAR |
| going-private/delisting language | Requires an SC 13E-3 and financing disclosures |
| SEC/investigation/lawsuit language | Litigation releases and court dockets are public record |
| any matched entity is SpaceX, xAI, or X (`PRIVATE_COMPANY_IDS`) | No mandatory disclosures exist for private companies — expect it to stay unverified longer |

Plus three standing checks appended to every analysis: independent tier-2 sourcing (not the same
wire story), a first-hand statement weighed against the actor's own track record, and a
time-box ("official confirmation usually lands within days; silence past that window is itself
evidence").

## Logging a rumor

The page's "Log to watchlist" action mints a new `Source` (type chosen by the user — `rumor` by
default, or `reporting`/`first-hand` if the story came from a more credible outlet) and a new
`Event` tagged `'rumor-watch'`, with the pasted text as the account quote. It joins:

- The **Timeline**, immediately, with whatever `EventStatus` its single account derives.
- The desk's own **watchlist** section (every event tagged `'rumor-watch'`, most recent first).

As the story develops, confirmations or denials are attached from the event's own page (see
[Events](events.md)) — the status, and the corpus-wide base rate this desk shows next time,
update themselves automatically.

## Data dependencies

`STATUS_META`, `formatDate`, `freshId`, `statusOf` from `evidence.ts`; the whole analysis from
`judge.ts`.
