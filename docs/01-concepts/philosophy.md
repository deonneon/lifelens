[docs](../README.md) / [concepts](README.md) / philosophy

# Philosophy

LifeLens is a cited, additive knowledge base for the Musk universe — Elon Musk, Tesla, SpaceX,
xAI, and everyone and everything orbiting them. Five ideas hold the whole app up. Every other
document in `docs/` is downstream of these.

## 1. Characters, not just people

The organizing unit is a **character** — anything with a name, a bio, and a place in the story.
That includes companies (Tesla, SpaceX, xAI, Apple) as much as people (Musk, Eberhard, Shotwell).
Treating a company as a character lets the same machinery — bios, relationships, event
participation, citations — apply uniformly across the whole cast. See
[`Entity`](data-model.md#entity) and the [Universe map](../03-features/universe.md).

## 2. Events are atomic; truth is derived, never asserted

The smallest unit of history is an **event** — something that happened, on a date, involving one
or more characters. An event itself carries no truth value. What it carries is **accounts**: one
per source, each taking a stance (`supports` / `disputes` / `clarifies`). The event's
`EventStatus` — corroborated, single-source, disputed, or rumor — is *computed* from those
accounts by [`deriveStatus`](../02-architecture/state-management.md), every time, from scratch.

This is the mechanism behind "there may be wrong news": nothing is overwritten when a new,
contradicting account arrives. It's added. The status recomputes. The old account is still there,
still readable, still cited. Disagreement is data, not an error state.

## 3. Additive ingestion — never overwrite

Every ingestion path (`/ingest`, the Rumor Desk's "log to watchlist", attaching an account from an
event page) only ever **adds**: a new source, a new event, or a new account. Nothing in the store
is ever deleted or mutated in place except two reversible flags (`dismissed` on a pending
character, and the manual account-attach form). This is what makes the corpus safe to keep feeding
— sources of wildly different reliability (a biography, an SEC complaint, a tweet, a rumor) can
all go in without one clobbering another.

## 4. Significance is earned, not assumed

Ingesting real text surfaces a lot of names — an assistant, a reporter quoted in passing, a
one-time mention. If every name became a full character immediately, the universe would fill with
walk-on parts and the map would stop meaning anything. So a detected name starts on the **orbit
watch** (a `PendingCharacter`) and only becomes a full `Entity` once it accumulates
`SIGNIFICANCE_THRESHOLD` (3) distinct documented events, or a human promotes it early. See
[the significance gate](../02-architecture/significance-gate.md).

## 5. Every claim traces to a source

Prose in this app is never freestanding. Character bios are arrays of `CitedSegment` (`{ text,
sourceIds }`); event accounts carry a `quote` and `sourceId`; decision rationale and counterpoints
are cited segments too. The UI renders citations as clickable, numbered superscripts
(`CiteMarks`/`FootnoteList`) so a reader can always get from a sentence to the exact source behind
it. The **Explainer Studio** and **Decision Desk** dossiers take this further: their entire output
is *assembled* from already-cited material, never generated prose — so the credibility of the
output is exactly the credibility of its citations.

## What these five ideas produce

| Idea | Produces |
|---|---|
| Characters as the frame | The [Universe map](../03-features/universe.md), cross-cutting navigation everywhere |
| Derived, never-asserted status | The [evidence engine](evidence-tiers.md), dispute-safe ingestion |
| Additive-only mutation | Safe multi-source ingestion, a [Rumor Desk](../03-features/rumor-desk.md) that tracks claims to resolution |
| Earned significance | The [significance gate](../02-architecture/significance-gate.md), a map that stays meaningful |
| Cited-only prose | Footnoted dossiers, and a publishing pipeline ([Explainer Studio](../03-features/explainer-studio.md)) that is assembly, not generation |

Two features built on top of this foundation answer specific use cases the app was built for:

- **Rumor Desk** (`/rumor-desk`) — a fresh, unverified story breaks; assemble everything the
  corpus already knows (related history, actor track records, rumor base rates, filing
  checklists) to help judge it *before* it resolves — aimed at trading decisions.
- **Decision Desk** (`/decisions`) — a design or strategy pivot ("why did Starship switch to
  stainless steel?") is its own kind of thread: what was replaced, what replaced it, the options
  weighed, and the cited rationale — answerable on command, or turned into a research brief when
  the ledger doesn't know yet.
