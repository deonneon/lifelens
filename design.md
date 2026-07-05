# LifeLens Design System

**"An archive at night."** LifeLens is an evidence ledger — a calm, quiet instrument for judging noisy stories. The interface is built around that idea: a dark, unhurried archive where editorial typography carries the narrative and a small set of reserved semantic colors carries the *evidence state* of everything on screen. Nothing decorative competes with the one question the user is always asking: *how well is this claim supported?*

---

## 1. Design principles

1. **Evidence state is the first read.** Before a user reads a single word of an event, its status (corroborated / single source / disputed / rumor) is visible — as a colored rail on the card edge, a labeled badge, a dot. Color is never the only channel: every status color ships with a text label and a fixed position.
2. **Editorial voice, instrument body.** Headlines and event titles are set in a display serif (the biography, the story); data — dates, counts, tiers, tickers — is set in a monospace (the instrument). UI chrome stays in a neutral sans. The three voices never blur.
3. **Calm surfaces, reserved color.** Grays do the layout; color does semantics. The single brand accent (iris) marks interaction and identity. The four status colors are *reserved* — they are never used as decoration or as chart series.
4. **Depth by layering, not by lines.** Surfaces step up in lightness (`canvas → surface-1 → surface-2 → surface-3`) with hairline borders at low alpha. Shadows are soft and used sparingly (cards, glow on the primary action).
5. **Hover reveals, never hides.** Popovers (citations, map dossiers, density tooltips) add detail, but every fact shown on hover is also reachable on a page of its own.

---

## 2. Foundations

### 2.1 Color tokens

Defined in `tailwind.config.js`; consumed as Tailwind utilities (`bg-surface-1`, `text-ink-400`, `border-edge`, …).

**Surfaces** — the elevation ramp. Every container sits on exactly one step.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#0B0C12` | page background (with ambient `.app-bg` gradients) |
| `surface-1` | `#12141C` | cards, panels |
| `surface-2` | `#181B25` | inputs, chips, nested panels, popovers |
| `surface-3` | `#1F2330` | active/selected fills, hover steps |
| `edge` | `rgba(148,163,199,.14)` | hairline borders, dividers |
| `edge-bright` | `rgba(148,163,199,.28)` | hover/active borders |

**Ink** — the text hierarchy. Never use raw white/slate; pick a step.

| Token | Value | Role |
|---|---|---|
| `ink-50` | `#F4F5FA` | display titles, emphasized names |
| `ink-100` | `#E5E7F0` | card titles, primary content |
| `ink-300` | `#B9BDCE` | body text |
| `ink-400` | `#8F94A9` | secondary text, ledes |
| `ink-500` | `#6E7389` | metadata, eyebrows |
| `ink-600` | `#4C5065` | placeholders, faint annotations |

**Accent** — one brand hue, iris. Interaction, links, person-nodes, "clarifies".

| Token | Value |
|---|---|
| `accent` | `#7C6CF0` |
| `accent-bright` | `#948AF6` (links, icons on dark) |
| `accent-deep` | `#5B4BD4` |

**Status — reserved semantic palette.** These are the product's core encoding and are used *only* for evidence semantics. Validated with the dataviz palette validator against `surface-1` (dark): contrast ≥ 3:1 for all four; CVD separation passes (worst adjacent pair 42.9 ΔE protan). Tritan separation of rose↔sky sits in the floor band, which is why **status color never appears without a text label or a fixed position** (badge labels, fixed stack order in charts, tooltips with counts).

| Token | Value | Meaning | Also used for |
|---|---|---|---|
| `status-good` | `#34D399` | Corroborated | stance *Supports*, tier T1 |
| `status-info` | `#38BDF8` | Single source | company nodes/markers, tier T2 |
| `status-bad` | `#FB7185` | Disputed | stance *Disputes* |
| `status-warn` | `#FBBF24` | Rumor | orbit-watch (pending characters), tier T4 |

Stance *Clarifies* and tier T3 use the accent — they are "more context," not verdicts.

### 2.2 Typography

Self-hosted variable fonts (fontsource; no runtime network dependency).

| Family | Token | Voice | Where |
|---|---|---|---|
| **Fraunces Variable** | `font-display` | editorial, biographical | page titles, section titles, event/character names |
| **Inter Variable** | `font-sans` (default) | neutral chrome | body, controls, navigation |
| **JetBrains Mono Variable** | `font-mono` | instrument | dates, counts, tiers (`T1 · Record`), year axis, stat numerals |

**Composed patterns** (defined in `src/index.css` `@layer components`):

- `.eyebrow` — 11px, uppercase, `+0.16em` tracking, `ink-500`. Names the *kind* of page ("Knowledge graph", "Live judgment").
- `.page-title` — Fraunces 36px semibold, tight tracking, `ink-50`, with optical-size/softness variation settings.
- `.section-title` — Fraunces 20px semibold.
- `.lede` — 15px/relaxed, `ink-400`, max-width 48rem. Every page opens eyebrow → title → lede.

Scale in practice: 36 / 20 / 17 (card titles) / 15 (lede) / 14 (body) / 13 (card body) / 11–12 (meta, badges). Line-height relaxed for prose, snug for titles.

### 2.3 Shape, depth, motion

- **Radii:** cards & panels `2xl` (18px); inputs & nav items `xl` (14px); badges 6px; chips/buttons full.
- **Shadows:** `shadow-card` (soft ambient for cards), `shadow-glow` (accent ring + bloom, only on the primary CTA and the timeline's "now" dots), `shadow-pop` (overlays).
- **Motion:** 150–200ms ease transitions on border/background/color; cards lift 1px on hover (`card-hover`); buttons compress to 98% on press; the map's center node breathes via `.pulse-ring` (3.2s). Nothing animates without pointer intent except the single pulse.
- **Ambience:** `.app-bg` layers two very-low-alpha radial glows (iris top-right, sky bottom-left) and a handful of 1px "dust" stars over `canvas`, fixed-attachment. It reads as atmosphere at < 10% alpha and never competes with content contrast.

---

## 3. Components

All primitives live in `src/index.css` (`@layer components`) and `src/components/`.

| Component | Spec |
|---|---|
| **`.card`** | `surface-1`, `edge` hairline, radius 18, `shadow-card`. Optional `.card-hover` for navigable cards. |
| **Event card** (`EventCard`) | Card with a 3px **status rail** on the left edge (the status color, full height) so a column of results reads as an evidence spectrum before any text is parsed. Row: mono date · status badge · mono source count (+ red disputing count). Fraunces title, 2-line clamped summary, participant chips. |
| **Badges** (`badges.tsx`) | 11px medium, 6px radius, tinted fill at 10% + ring at 30% of the semantic color, always with a text label; status badges add a 6px dot. Tier badges are mono (`T1 · Record`). |
| **Chips** (`.chip` / `EntityChip`) | Pill, `surface-2` + `edge`; active filter state = `.chip-active` (accent fill 15%, accent ring). Entity chips prefix a kind glyph: ● person (accent), ■ company (sky). |
| **Buttons** | `.btn-primary` — accent fill, white text, `shadow-glow`; one per view (the main action). `.btn-ghost` — hairline outline. Destructive/irreversible actions are never primary-styled. |
| **Inputs** (`.input-field`) | `surface-2`, hairline, 14px radius; focus = accent border + 2px accent ring at 20%. Placeholders `ink-600`. |
| **Citation marks** (`Citations.tsx`) | Superscript `[n]` in `accent-bright`; hover popover (`surface-2`/95 + blur, `shadow-pop`) shows source title, type, author, date. Paired with a numbered `FootnoteList` at the section end — numbering is per-page order of first appearance. |
| **Progress meter** (orbit watch) | 6px track `surface-3`, fill `status-warn`, mono fraction label (`2 / 3 events`). Warn color because pending characters are "unverified state". |

---

## 4. Layout system

**Shell:** fixed 240px left sidebar (desktop): brand (Fraunces) → icon nav → primary CTA → corpus stats (three mono stat cells: events / sources / accounts) → reset link. Nav icons are 17px, 1.6px-stroke geometric line icons drawn inline (no icon dependency). Active item: `surface-2` fill, accent icon, trailing accent dot. On `< lg` the sidebar becomes a sticky top bar with a horizontally scrollable nav row.

**Content column:** `max-w-6xl`, 20–32px gutters, 48px top rhythm on desktop.

**Page header pattern (every page):**

```
.eyebrow      KNOWLEDGE GRAPH
.page-title   The Universe
.lede         One-paragraph orientation, max-w-3xl.
```

**Two-column dossiers** (character page, explainer studio): content column + 320–360px aside of cards, collapsing to single column below `lg`.

---

## 5. Data visualization

Follows the dataviz method: form first, semantic color, validated palette, labeled marks, hover layer, no color-alone encoding.

### 5.1 Universe map (`pages/Universe.tsx`)

An SVG constellation; **identity and structure, not quantity** — the only quantitative encoding is node size.

- **Shape = kind:** circles for people, rounded squares for companies (redundant with color, so CVD-safe).
- **Fill:** radial gradients (`#node-person` iris, `#node-company` sky) with a 30%-offset highlight — reads as lit spheres/tiles against the flat canvas.
- **Size = documented activity:** radius `13 + 4.5·√(events)`, capped; the count itself is printed in the node in mono (direct label — the number is never color/size-alone).
- **Layout:** Musk fixed center with a breathing `pulse-ring`; companies on the inner dashed orbit, people on the outer. Orbit guides at ≤ 9% alpha.
- **Edges:** quadratic curves bowed 12% outward from center (reduces crossings/overlap ambiguity); rest state 13% alpha, connected-to-hover state accent at 85%.
- **Hover focus:** unrelated nodes dim to 25%; a side dossier card shows kind, origin, event count, top relationships. Click navigates — hover never gates information (the same data lives on the character page).
- **Labels:** 12.5px Inter under each node with a 3.5px canvas-colored stroke halo (`paint-order: stroke`) so labels survive edge crossings.

### 5.2 Activity density strip (`pages/Timeline.tsx`)

A compact per-year stacked bar strip above the timeline — **magnitude over time, segmented by status**.

- One column per year *with events* (sparse decades don't waste axis space); mono 2-digit year labels.
- Stack uses the **reserved status palette in a fixed order** (corroborated at the baseline → single-source → disputed → rumor on top). Fixed order + labels = the tritan-floor mitigation.
- **2px canvas gaps** between stacked segments; 2px rounded segment corners; 3px gaps between columns.
- Height scaled to the max-count year (56px), 6px minimum segment so single events stay visible.
- **Hover:** native tooltip with the year's full breakdown ("2008 — 4 events: 3 corroborated, 1 disputed"); columns brighten on hover.
- **Click = jump:** smooth-scrolls to that year's section (`scroll-mt` keeps the heading clear of the top bar). The strip is a *navigation instrument*, not just a chart.
- The strip reflects current filters — filter to one character and it becomes that character's activity profile.

### 5.3 Stat tiles (Rumor Desk)

Headline numbers (related-context count, rumor base rate) are **stat tiles**, not charts: eyebrow label, Fraunces numeral, status-dot breakdown lines underneath. No axes where a single number is the message.

---

## 6. Accessibility

- **Contrast:** body inks on their surfaces ≥ 7:1 (`ink-300`+), metadata ≥ 4.5:1; all four status colors ≥ 3:1 on `surface-1` (validated, §2.1). Large display text `ink-50` ≈ 15:1.
- **Never color-alone:** statuses/stances/tiers always carry text labels; node kind is double-encoded (shape + color); density-strip stacks have fixed order + tooltips.
- **Focus:** global `:focus-visible` ring (2px accent at 60%) on every interactive element; filter chips and nav are real buttons/links.
- **Hover parity:** everything a popover shows exists on a navigable page (citations → source library; map dossier → character page; density tooltip → the year section itself).
- **Motion restraint:** micro-transitions only; the single ambient animation (pulse ring) is decorative and low-alpha.

---

## 7. File map

| Concern | File |
|---|---|
| Color/font/shadow/radius tokens | `tailwind.config.js` |
| Font imports, base styles, component classes, ambience, keyframes | `src/index.css` |
| Shell & navigation | `src/components/Layout.tsx` |
| Badges, chips | `src/components/badges.tsx` |
| Event card (status rail) | `src/components/EventCard.tsx` |
| Citation marks & footnotes | `src/components/Citations.tsx` |
| Status/stance/tier semantic classes | `src/lib/evidence.ts` (`STATUS_META`, `STANCE_META`) |
| Universe map | `src/pages/Universe.tsx` |
| Density strip | `src/pages/Timeline.tsx` |

**Extending the system:** new surfaces come from the four-step ramp (never new grays); new text styles come from the ink scale; any new *state* gets a labeled badge built from an existing semantic color — if it isn't one of good/info/bad/warn semantics, it isn't colored.
