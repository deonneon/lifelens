[docs](../README.md) / architecture

# Architecture

The cross-cutting mechanics every feature builds on: how state is held and persisted, how a
mentioned name earns its way into the cast, and how pasted text becomes candidate events.

| Doc | Covers |
|---|---|
| [state-management.md](state-management.md) | `src/lib/store.tsx` — the reducer, actions, `localStorage` persistence and migration |
| [significance-gate.md](significance-gate.md) | `src/lib/mentions.ts` — orbit watch, the promotion algorithm, dismissal |
| [extraction-pipeline.md](extraction-pipeline.md) | `src/lib/extract.ts` — LLM (Gemini/OpenAI) and offline heuristic extraction |

Feature-specific logic (the Rumor Desk's `judge.ts`, the Explainer Studio's `composer.ts`, the
Decision Desk's `decisions.ts`) is documented alongside its feature in
[03-features](../03-features/README.md) rather than here, since each is single-purpose and only
meaningful in context.

Previous: [← Concepts](../01-concepts/README.md) · Next: [Features →](../03-features/README.md)
