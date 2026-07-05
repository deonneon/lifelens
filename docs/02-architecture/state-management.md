[docs](../README.md) / [architecture](README.md) / state management

# State management

Source of truth: [`src/lib/store.tsx`](../../src/lib/store.tsx).

## Shape

One `UniverseState` object (see [data model](../01-concepts/data-model.md)), held in a single
`useReducer`, exposed through React context (`UniverseProvider` / `useUniverse()`). There is no
backend — the whole app is client-side.

```
UniverseProvider
├── state: UniverseState                (from useReducer)
└── actions, all dispatching a typed ActionType:
    ADD_SOURCE      { source }
    ADD_EVENT       { event, accounts }
    ADD_ACCOUNT     { account }
    ADD_DECISION    { decision }
    RECORD_MENTIONS { mentions: MentionInput[] }
    PROMOTE_PENDING { pendingId }
    DISMISS_PENDING { pendingId }
    RESET
```

## The reducer

Every case is a small, pure append (or, for `RECORD_MENTIONS`/`PROMOTE_PENDING`, a delegated call
into [`src/lib/mentions.ts`](../../src/lib/mentions.ts) — see
[the significance gate](significance-gate.md)):

- `ADD_SOURCE` / `ADD_DECISION` — de-duplicate by `id` first (a no-op re-dispatch is harmless),
  then append.
- `ADD_EVENT` — appends the event *and* its opening accounts in one dispatch, so an event never
  exists without at least one account backing it.
- `ADD_ACCOUNT` — appends only; this is how new testimony attaches to an existing event (from the
  event page's "Add an account" form, or an ingest row merged into an existing event).
- `DISMISS_PENDING` — the one exception to append-only: flips a `dismissed` flag on a
  `PendingCharacter` so it stops being eligible for auto-promotion. Reversible in principle (no UI
  currently un-dismisses, but nothing prevents it).
- `RESET` — replaces the whole state with `SEED`. Gated behind a `confirm()` in the UI (the
  sidebar's "↺ Reset to seed data").

Nothing in the reducer ever removes an event, source, or account. That's a deliberate constraint,
not an oversight — see [additive ingestion](../01-concepts/philosophy.md#3-additive-ingestion--never-overwrite).

## Persistence

```
localStorage key: 'lifelens.universe.v1'
```

- **Load** (`load()`): read the key; if missing, unparseable, or missing `entities`/`events`, fall
  back to `SEED` entirely. If present, merge in any *newer* top-level fields the stored blob might
  predate — currently `pending ?? SEED.pending` and `decisions ?? SEED.decisions`. This is the
  app's only migration mechanism: **when you add a new top-level `UniverseState` field, add a
  matching `?? SEED.<field>` fallback here**, or older saved states will load with that field
  `undefined` and every selector that reads it will throw.
- **Save**: a `useEffect` on `state` writes the whole object back to `localStorage` on every
  change, wrapped in try/catch (storage full or unavailable degrades to in-memory-only, silently).

There is no schema versioning beyond the `.v1` suffix in the key name — a breaking shape change
should bump it to `.v2` and let old data fall back to `SEED` rather than crash on load.

## Adding a new mutation

1. Add the action to the `ActionType` union.
2. Handle it in `reducer()` — keep it a pure, append-only transform if at all possible.
3. Add a dispatcher method to `StoreValue` and wire it in the `useMemo` in `UniverseProvider`.
4. If the action touches a new top-level state field, add the `load()` migration fallback above.
5. If it's exercised by seed data, extend the check suite (see
   [verification](../06-development/verification.md)).
