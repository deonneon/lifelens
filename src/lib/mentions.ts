import type {
  Entity,
  EntityKind,
  PendingCharacter,
  UniverseState,
} from '../types'

/**
 * A name joins the universe as a full character only once it appears in this
 * many distinct documented events. Below that it stays on the orbit watch.
 */
export const SIGNIFICANCE_THRESHOLD = 3

export interface MentionInput {
  name: string
  kindGuess: EntityKind
  eventId: string
  sourceId: string
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function distinctEventCount(p: PendingCharacter): number {
  return new Set(p.mentions.map((m) => m.eventId)).size
}

export function isSignificant(p: PendingCharacter): boolean {
  return distinctEventCount(p) >= SIGNIFICANCE_THRESHOLD
}

function findEntityByName(state: UniverseState, name: string): Entity | undefined {
  const lower = name.trim().toLowerCase()
  return state.entities.find(
    (e) =>
      e.name.toLowerCase() === lower ||
      e.aliases.some((a) => a.toLowerCase() === lower),
  )
}

/** Add an entity to an event's participant list if it isn't there yet. */
function withParticipant(state: UniverseState, eventId: string, entityId: string): UniverseState {
  return {
    ...state,
    events: state.events.map((ev) =>
      ev.id === eventId && !ev.participants.some((p) => p.entityId === entityId)
        ? { ...ev, participants: [...ev.participants, { entityId, role: 'mentioned' }] }
        : ev,
    ),
  }
}

/**
 * Promote a pending character into a full entity: create it (with a bio
 * segment citing the sources that mentioned it and relationships to its most
 * frequent co-participants), attach it to every event that mentioned it, and
 * clear it from the pending ledger.
 */
export function promotePending(state: UniverseState, pendingId: string): UniverseState {
  const p = state.pending.find((x) => x.id === pendingId)
  if (!p) return state

  const eventIds = [...new Set(p.mentions.map((m) => m.eventId))]
  const sourceIds = [...new Set(p.mentions.map((m) => m.sourceId))]

  let next: UniverseState = { ...state, pending: state.pending.filter((x) => x.id !== pendingId) }

  const existing = findEntityByName(state, p.name) ?? state.entities.find((e) => e.id === p.id)
  let entityId: string
  if (existing) {
    entityId = existing.id
  } else {
    entityId = p.id
    // rank co-participants across the mentioning events to seed relationships
    const cooccurrence = new Map<string, number>()
    for (const ev of state.events) {
      if (!eventIds.includes(ev.id)) continue
      for (const part of ev.participants) {
        cooccurrence.set(part.entityId, (cooccurrence.get(part.entityId) ?? 0) + 1)
      }
    }
    const relationships = [...cooccurrence.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([targetId]) => ({ targetId, label: 'appears alongside' }))

    const entity: Entity = {
      id: entityId,
      kind: p.kindGuess,
      name: p.name,
      aliases: [],
      bio: [
        {
          text: `${p.name} was promoted into the universe after appearing in ${eventIds.length} documented events — enough to become a significant part of the story. This dossier grows as sources accumulate.`,
          sourceIds,
        },
      ],
      relationships,
    }
    next = { ...next, entities: [...next.entities, entity] }
  }

  for (const eventId of eventIds) {
    next = withParticipant(next, eventId, entityId)
  }
  return next
}

/**
 * Record freshly-ingested mentions. Names matching an existing character are
 * attached to the event directly; unknown names accumulate in the pending
 * ledger and are auto-promoted only once they cross SIGNIFICANCE_THRESHOLD
 * distinct events.
 */
export function applyMentions(state: UniverseState, mentions: MentionInput[]): UniverseState {
  let next = state
  for (const m of mentions) {
    const name = m.name.trim()
    if (!name) continue

    const known = findEntityByName(next, name)
    if (known) {
      next = withParticipant(next, m.eventId, known.id)
      continue
    }

    const id = slugify(name)
    const existing = next.pending.find((p) => p.id === id)
    if (existing) {
      const already = existing.mentions.some(
        (x) => x.eventId === m.eventId && x.sourceId === m.sourceId,
      )
      next = {
        ...next,
        pending: next.pending.map((p) =>
          p.id === id
            ? {
                ...p,
                dismissed: false,
                mentions: already ? p.mentions : [...p.mentions, { eventId: m.eventId, sourceId: m.sourceId }],
              }
            : p,
        ),
      }
    } else {
      next = {
        ...next,
        pending: [
          ...next.pending,
          { id, name, kindGuess: m.kindGuess, mentions: [{ eventId: m.eventId, sourceId: m.sourceId }] },
        ],
      }
    }
  }

  // auto-promote anything that just crossed the significance threshold
  for (const p of next.pending.filter((x) => !x.dismissed && isSignificant(x))) {
    next = promotePending(next, p.id)
  }
  return next
}
