[docs](../README.md) / [reference](README.md) / glossary

# Glossary

| Term | Meaning |
|---|---|
| **Character** | This app's word for anything with a place in the story — a person *or* a company. Modeled as `Entity`. |
| **Account** | One source's testimony about one event: a stance (supports/disputes/clarifies), a quote, an optional locator. Events accumulate accounts; they never overwrite each other. |
| **Stance** | An account's relationship to its event: `supports`, `disputes`, or `clarifies`. |
| **Status** (`EventStatus`) | An event's *derived* evidence state — `corroborated`, `single-source`, `disputed`, or `rumor`. Computed fresh from accounts every time; never stored. See [evidence-tiers.md](../01-concepts/evidence-tiers.md). |
| **Tier** | A source's reliability rank, 1 (strongest, official records) to 4 (weakest, rumor). See [evidence-tiers.md](../01-concepts/evidence-tiers.md). |
| **Orbit Watch** | The UI (`/characters#orbit-watch`) for `PendingCharacter` records — names detected but not yet significant enough to be full characters. |
| **Significance gate** | The rule that a detected name becomes a full `Entity` only after `SIGNIFICANCE_THRESHOLD` (3) distinct documented events, or manual promotion. See [significance-gate.md](../02-architecture/significance-gate.md). |
| **Promotion** | Converting a `PendingCharacter` into a full `Entity`, lossless — mentions become a cited bio segment, participants, and co-occurrence-ranked relationships. |
| **Additive ingestion** | The app's core mutation rule: sources, events, and accounts are only ever appended, never edited or deleted, by normal app flows. See [philosophy.md](../01-concepts/philosophy.md). |
| **Decision (thread/dossier)** | A design or strategy pivot record: `from → to`, options weighed, cited rationale/counterpoints, and a linked event thread. See [decision-desk.md](../03-features/decision-desk.md). |
| **Rationale grade** | A decision's evidence strength readout: the strongest source tier cited in its rationale/counterpoints, plus distinct source count. |
| **Seek** (Decision Desk) | Asking a plain-language question and getting either a matching decision dossier or a research brief describing what to go find. |
| **Research brief** | What `seekDecision` returns when no decision thread answers the question: detected characters, adjacent ledger history, and a list of what evidence to seek. |
| **Rumor watchlist** | Events tagged `'rumor-watch'`, created via the Rumor Desk's "Log to watchlist" action, tracked to resolution. |
| **Cited segment** (`CitedSegment`) | The unit of citable prose: `{ text, sourceIds }`. Used for entity bios and decision rationale/counterpoints. |
| **Base rate** (Rumor Desk) | Across the whole corpus, how tier-4-sourced events have historically resolved (corroborated / disputed / still open) — context for judging a new rumor. |
| **Anchor** (Rumor Desk) | A tier-1 (official-record) account quote on an event related to the rumor being analyzed — "the hardest evidence in the vicinity." |
| **Actor track record** (Rumor Desk) | For a named character: how many of their events rest on a first-hand/self-reported account, and how many of those turned out disputed. |
