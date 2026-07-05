[docs](../README.md) / design system

# Design system

The full visual design system — principles, every color/type/shadow token, component specs, the
Universe map and Timeline density-strip dataviz specs, and the accessibility pass — lives in
**[`/design.md`](../../design.md)** at the repo root (kept there rather than under `docs/` since
it predates this hierarchy and other docs already link to it at that path).

## Quick orientation

**Theme**: "an archive at night" — a dark, unhurried surface where editorial typography (Fraunces
display serif) carries the narrative, monospace (JetBrains Mono) carries data/dates/tiers, and a
small reserved set of semantic colors carries *evidence state* — never decoration.

| Concern | Where |
|---|---|
| Design principles (5 rules) | [`design.md` §1](../../design.md) |
| Color tokens (surfaces, ink scale, accent, status) | [`design.md` §2.1](../../design.md) |
| Typography (Fraunces/Inter/JetBrains Mono) | [`design.md` §2.2](../../design.md) |
| Component specs (cards, badges, chips, buttons) | [`design.md` §3–4](../../design.md) |
| Universe map & activity density strip dataviz specs | [`design.md` §5](../../design.md) |
| Accessibility (contrast, color-never-alone, focus, motion) | [`design.md` §6](../../design.md) |
| File map (which file owns which visual concern) | [`design.md` §7](../../design.md) |

## The one rule worth repeating here

> If it isn't one of the four evidence semantics (`corroborated` / `single-source` / `disputed` /
> `rumor` — see [evidence tiers](../01-concepts/evidence-tiers.md)), it isn't colored.

Every new component should be checked against this before reaching for a color that isn't already
one of the reserved status hues or the single brand accent.

Previous: [← Features](../03-features/README.md) · Next: [Reference →](../05-reference/README.md)
