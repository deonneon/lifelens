[docs](../README.md) / [development](README.md) / getting started

# Getting started

## Install & run

```bash
npm install
npm run dev       # Vite dev server with HMR
```

## Other scripts

| Command | Does |
|---|---|
| `npm run build` | `tsc -b` (project-references typecheck) then `vite build` → `dist/` |
| `npm run lint` | ESLint over the whole repo (flat config, `typescript-eslint` + `react-hooks` + `react-refresh`) |
| `npm run preview` | Serves the built `dist/` locally — useful for a final visual pass before shipping |

There is no test runner configured in `package.json` — see
[verification.md](verification.md) for how this app is actually checked.

## Optional: LLM-backed extraction

Copy `.env.example` to `.env` and set either provider's key — see
[environment variables](../05-reference/environment-variables.md) for the full list. Without any
key, `/ingest` still works fully, using the built-in offline heuristic extractor.

## Persistence & resetting

The app persists all local additions to `localStorage` (`lifelens.universe.v1`). The sidebar's
"↺ Reset to seed data" link (behind a `confirm()`) discards local changes and restores
`src/data/seed.ts`. There is no server-side data — everything lives in the browser.

## Stack

- Vite 6 + React 19 + TypeScript (strict, `noUnusedLocals`)
- Tailwind 3 (design tokens in `tailwind.config.js` — see [design system](../04-design-system/README.md))
- `react-router-dom` 7
- No backend, no database — `UniverseState` in React context + `useReducer`, persisted to
  `localStorage`
- Self-hosted variable fonts via `@fontsource-variable/*` (Fraunces, Inter, JetBrains Mono) — no
  external font requests
