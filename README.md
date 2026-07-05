# LifeLens — The Musk Universe, Cited

LifeLens is a **living biography** of the Elon Musk universe — Musk, Tesla, SpaceX, xAI, and every person and company caught in their orbit. It works like a Wikipedia crossed with an evidence locker: any source can be ingested (biographies, SEC filings, reputable reporting, first-hand statements, even rumors), the record only ever grows, and every claim is traceable to the specific accounts that back it — or dispute it.

## The core idea: events, not articles

The atomic unit is the **Event**: something that happened at a point in time, involving one or more **characters** (people or companies). Events are never asserted as bare facts. They exist only through **Accounts** — what a specific **Source** says about the event, with a stance:

- **supports** — the source affirms the event as described
- **disputes** — the source contradicts it
- **clarifies** — the source adds context that reframes it

An event's truth-status is **derived, never hand-written**, from its accounts:

| Status | Meaning |
|---|---|
| 🟢 Corroborated | Backed by an official record, or ≥2 independent non-rumor sources |
| 🔵 Single source | Only one non-rumor source so far |
| 🔴 Disputed | At least one account challenges the event as described |
| 🟡 Rumor | Supported only by unverified sources |

Sources are tiered by reliability: **T1** official records (court filings, SEC documents) → **T2** researched work (reporting, biographies) → **T3** self-reported (tweets, press releases, autobiography — primary but self-interested) → **T4** rumor. Rumors are welcome: they enter the record at tier 4 and get judged against everything else, because with enough accounts the truth tends to surface.

This is how the app handles wrong news: nothing is overwritten. The SEC's "false and misleading" complaint sits directly beside Musk's "funding secured" tweet; Tim Cook's "I've never spoken to Elon" sits beside Musk's story of trying to sell Tesla to Apple. Readers see all accounts, their tiers, and their stances — and judge.

## The Rumor Desk — judging a story before it resolves

The point of accumulating all this cited history is to use it when a fresh, unverified story breaks (`/rumor-desk`). Paste the story and the desk assembles the judgment context live:

- **Characters named** — who in the universe the story implicates
- **Related context on file** — the most relevant prior events, ranked by shared characters and subject overlap, each with its evidence status
- **Actor track record** — how often events involving the named actors that rest on *their own* first-hand claims ended up formally disputed (e.g. Musk's "funding secured" and the Apple story are in the ledger)
- **Rumor base rate** — how tier-4-sourced events across the corpus actually resolved: corroborated, disputed, or still open
- **Hardest evidence nearby** — official-record (tier 1) accounts attached to the related events, the anchors any new claim must square with
- **What confirmation looks like** — a checklist keyed to the claim type: 8-K / SC 13D for M&A rumors, 8-K Item 5.02 for CEO-change rumors, S-1 for IPO talk, SC 13E-3 for going-private, plus independence and time-boxing checks (with a warning when the story involves a private company where no filing will ever come)

Then **log the rumor**: it enters the universe as a tier-4 event on a watchlist. As confirmations or denials arrive, attach them as accounts on the event page — its status updates automatically, the watchlist shows where every open rumor stands, and each resolution sharpens the base rates the desk shows you next time. Context and signals, not verdicts: the judgment stays with you.

## The Explainer Studio — publish the context

The companion use case (`/explainer`): a story is out and everyone is reacting to the headline. Paste it and the studio composes an educational deep-dive **from the evidence ledger itself** — no generation, pure assembly, so every sentence is traceable:

- **Cited article** (markdown): the players' cited bios, the relevant history in chronological order with `[n]` citations and evidence-status labels, a "Contested ground" section quoting *both sides* of any disputed event, actor track records, and a numbered source list.
- **X/Twitter thread**: the same material chunked into numbered ≤280-character posts — hook, players, one receipt-bearing post per event (`(src: …)`), ⚠️ dispute flags with the counter-quote, and a closing sources post. Character counts shown; copy the whole thread with one click.

You curate before you copy: toggle which characters get background sections and which precedent events make the cut. Supports `?q=` prefill for shareable drafts.

## Five lenses over one dataset

1. **Universe** (`/`) — a constellation map of every character, connected by relationships, sized by documented activity. The entry point for "focus on the universe."
2. **Timeline** (`/timeline`) — the master chronology. Filter by character, evidence status, source type, or text to pinpoint any activity by any character.
3. **Characters** (`/characters/:id`) — wiki-style dossiers with per-sentence citation superscripts, footnotes, relationships, and the character's full event history.
4. **Events** (`/events/:id`) — the evidence record: all accounts grouped by stance with tier badges, quotes and locators, an explanation of the derived status, and a form to attach new supporting/disputing/clarifying accounts.
5. **Sources** (`/sources`) — the library everything traces back to, sorted by tier, each expandable to the events it testifies about.

## Additive ingestion

**+ Add source** (`/ingest`) takes any pasted text plus source metadata. LifeLens proposes candidate events from it (via Gemini or OpenAI if a key is configured, otherwise a built-in date-and-name matcher). You review each candidate and either **merge it into an existing event** as a new account — choosing its stance — or **create a new event**. The universe only grows; disputes accumulate rather than overwrite.

### The significance gate

Extraction also spots **unknown names**, but a mention is not a character. New names land on the **orbit watch** (`/characters#orbit-watch`) as pending characters, accumulating cited mentions across events. Only when a name proves significant to the story — appearing in **3 distinct documented events**, or promoted manually by your judgment — does it become a full character, with its mention history converted into cited event participations and auto-seeded relationships. Names that never matter can be dismissed, so the universe doesn't fill with walk-on parts. The seed ships with Peter Thiel and Kimbal Musk waiting on the watch list at 2/3 events each.

## Seed data

The app ships with a curated, genuinely-cited seed: ~25 real events across 14 characters and ~26 real sources (Vance's and Isaacson's biographies, the Tesla incorporation certificate, *Eberhard v. Musk*, the SEC complaint and settlement, NASA awards, Reuters reporting, Musk's own posts…). It includes real disputes — the Tesla founder fight, "funding secured," and the Apple acquisition story — so the dispute machinery is visible out of the box. Your additions persist in `localStorage`; a footer button resets to seed.

## Running it

```bash
npm install
npm run dev
```

Optional LLM extraction for ingest — copy `.env.example` to `.env` and set either:

```
VITE_GEMINI_API_KEY=...        # Google AI Studio key (VITE_GEMINI_MODEL optional)
VITE_LLM_API_KEY=...           # OpenAI-compatible key (VITE_LLM_API_URL optional)
```

Without keys, ingestion falls back to the offline heuristic extractor.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS · react-router-dom. No backend: state lives in React context + `localStorage`, so the evidence model is easy to lift onto a real database later.

## Future directions

- Real persistence and multi-user curation (votes on accounts, editor trails)
- Independence detection (two outlets citing the same wire story ≠ two sources)
- Confidence scoring over time, contradiction alerts, and export to static wiki pages
