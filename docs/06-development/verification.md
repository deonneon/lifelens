[docs](../README.md) / [development](README.md) / verification

# Verification

There is no test framework wired into `package.json` — this project verifies changes with three
lightweight, ad hoc mechanisms instead. This doc describes the convention so it stays consistent
as the app grows.

## 1 · Static checks

Always run before considering a change done:

```bash
npx tsc --noEmit     # strict typecheck, noUnusedLocals
npx eslint src        # flat config: typescript-eslint + react-hooks + react-refresh
npm run build         # tsc -b && vite build — catches anything the above two miss
```

## 2 · Logic check suites (esbuild + Node, against real seed data)

Because everything under `src/lib/` (except `store.tsx`) is plain TypeScript with no React or DOM
dependency (see [file map](../05-reference/file-map.md#layer-boundaries)), it can be bundled and
run directly under Node, exercised against the actual `SEED` data rather than mocks. The pattern:

```ts
// scratch-check.ts — written to a scratch/tmp directory, not committed
import { SEED } from '/absolute/path/to/src/data/seed.ts'
import { someFunction } from '/absolute/path/to/src/lib/somelib.ts'

let pass = 0, fail = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) { pass++; console.log(`  ok  ${name}`) }
  else { fail++; console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

check('some invariant holds', someFunction(SEED) === expectedValue)
// … more checks, one assertion each, human-readable names …

console.log(`\n${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
```

Run with:

```bash
npx esbuild scratch-check.ts --bundle --format=esm --platform=node --outfile=scratch-check.mjs --log-level=error
node scratch-check.mjs
```

**Use absolute paths with explicit `.ts` extensions** for cross-directory imports — esbuild
resolving a scratch file's relative imports back into `src/` is brittle; absolute paths sidestep
it entirely. Existing suites in this project (see the session history / any
`*.check.ts` files kept in a scratch directory) cover:

- **Referential integrity** — every citation, participant, event link, and cross-decision link in
  seed data resolves to a real record. This is the check most likely to catch a typo in newly
  added seed data (a source id that doesn't exist, a dangling `eventId`).
- **Derived-value assertions** — e.g. that a specific seeded event derives to exactly the expected
  `EventStatus` given its accounts, or that `rationaleGrade` reports the expected tier.
- **Behavioral assertions** — e.g. that `seekDecision` for a specific question returns the
  expected decision id first, that an unrelated query correctly falls through to a research brief,
  that `promotePending` produces a lossless conversion.

When you change a `lib/` function's behavior, extend or add checks like this rather than trusting
a build pass alone — the build only proves the code compiles, not that `deriveStatus` or
`seekDecision` still return the right answer for the seed corpus.

## 3 · Visual verification (headless Chromium)

For any UI-visible change, actually render it — type-checking and unit checks don't verify feature
correctness on screen.

```bash
npm run build && npx vite preview --port 4173 &
/opt/pw-browsers/chromium --headless --disable-gpu --no-sandbox \
  --window-size=1440,1600 --virtual-time-budget=6000 \
  --screenshot=out.png 'http://localhost:4173/<route>'
```

Then `Read` the resulting PNG and actually look at it — check for label collisions, truncated
text, broken layout, and that the change matches intent. This project's Chromium is pre-installed
at `/opt/pw-browsers/chromium`; do not run `playwright install`.

## 4 · Dataviz-specific validation

Any new chart/visualization (the Universe map, the Timeline density strip, future additions)
should have its color palette run through the `dataviz` skill's palette validator rather than
eyeballed — it checks the lightness band, chroma floor, adjacent-pair colorblind separation, and
contrast against the actual surface color. See the `dataviz` skill's `references/` for the full
procedure; the short version is: pick the form → assign color by job (categorical/sequential/
diverging/status) → validate → apply mark specs → add hover → accessibility pass → look at the
render.

## Summary checklist for a change touching `src/lib/`

1. `tsc --noEmit` + `eslint` + `npm run build` all clean.
2. Existing esbuild check suite(s) for the touched module still pass.
3. If seed data changed: referential-integrity checks re-run clean (no dangling ids).
4. If the change is UI-visible: screenshot the affected route(s) and actually look.
