/** A character in the universe: a person or a company. */
export type EntityKind = 'person' | 'company'

export interface Relationship {
  targetId: string
  label: string
}

/** A fragment of narrative prose backed by explicit citations. */
export interface CitedSegment {
  text: string
  sourceIds: string[]
}

export interface Entity {
  id: string
  kind: EntityKind
  name: string
  aliases: string[]
  /** e.g. "b. June 28, 1971 — Pretoria, South Africa" or "founded 2002 — El Segundo, CA" */
  origin?: string
  bio: CitedSegment[]
  relationships: Relationship[]
}

export type SourceType =
  | 'official-record'
  | 'reporting'
  | 'biography'
  | 'autobiography'
  | 'first-hand'
  | 'analysis'
  | 'rumor'

export interface Source {
  id: string
  type: SourceType
  title: string
  author?: string
  publisher?: string
  date?: string
  url?: string
}

/** How one source's account relates to the event it describes. */
export type Stance = 'supports' | 'disputes' | 'clarifies'

/**
 * One source's testimony about one event. Events accumulate accounts over
 * time; contradictory accounts mark the event disputed rather than
 * overwriting each other.
 */
export interface Account {
  id: string
  eventId: string
  sourceId: string
  stance: Stance
  quote: string
  /** Where in the source: page, chapter, URL fragment, exhibit number… */
  locator?: string
}

export interface Participant {
  entityId: string
  role: string
}

/**
 * The atomic unit of the universe: something that happened at a point in
 * time, involving one or more characters. Its truth-status is derived from
 * its accounts, never asserted directly.
 */
export interface UniverseEvent {
  id: string
  /** 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD' — precision is implied by length. */
  date: string
  title: string
  summary: string
  location?: string
  participants: Participant[]
  tags: string[]
}

export type EventStatus = 'corroborated' | 'single-source' | 'disputed' | 'rumor'

/** One sighting of a not-yet-promoted name: which event, backed by which source. */
export interface PendingMention {
  eventId: string
  sourceId: string
}

/**
 * A name detected during ingestion that is NOT yet a character. Names only
 * become characters when they prove significant to the story — enough
 * distinct documented events (see SIGNIFICANCE_THRESHOLD) or a manual
 * promotion. Until then they wait here, accumulating mentions.
 */
export interface PendingCharacter {
  id: string
  name: string
  kindGuess: EntityKind
  mentions: PendingMention[]
  dismissed?: boolean
}

export interface UniverseState {
  entities: Entity[]
  sources: Source[]
  events: UniverseEvent[]
  accounts: Account[]
  pending: PendingCharacter[]
}
