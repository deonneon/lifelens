[docs](../README.md) / [reference](README.md) / environment variables

# Environment variables

All optional. With none set, `/ingest` extraction runs entirely on the offline heuristic — no
network calls, no keys required. Copy `.env.example` to `.env` to configure either provider (see
[extraction pipeline](../02-architecture/extraction-pipeline.md) for how they're tried and how
failures fall back).

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_GEMINI_API_KEY` | No | — | Google AI Studio key. If set (and not a placeholder), tried first. |
| `VITE_GEMINI_MODEL` | No | `gemini-1.5-flash` | Overrides the Gemini model used for extraction. |
| `VITE_LLM_API_KEY` | No | — | Bearer key for an OpenAI-compatible chat completions API. Tried if Gemini is unset or fails. |
| `VITE_LLM_API_URL` | No | `https://api.openai.com/v1/chat/completions` | Override to point at any OpenAI-compatible endpoint (self-hosted, proxy, alternate provider). |

## Notes

- `hasKey()` in `extract.ts` treats a value starting with `your_` as unset — this is what lets
  `.env.example`'s placeholder values ship safely without accidentally being treated as real keys
  if a user copies the file without editing it.
- All variables are `import.meta.env.*` Vite client-side env vars — they are **bundled into the
  client build**, not kept server-side secret. Do not put a production-sensitive key in
  `VITE_LLM_API_KEY` for a publicly deployed build; this app has no backend to proxy the call
  through.
- Declared for type-checking in [`src/env.d.ts`](../../src/env.d.ts).
