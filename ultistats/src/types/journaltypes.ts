export enum JournalEntryType {
  PASS = 'pass',
  PLAYER = 'player',
  POSITIVE_ACTION = 'positiveAction',
  NEGATIVE_ACTION = 'negativeAction',
  EVENT = 'event',
  LINE = 'line',
  COMMENT = 'comment',
}

export enum JournalEntrySource {
  USER = 'user',
  AI = 'ai',
}

export interface journalLine {
  type: JournalEntryType
  name: string
  id: number
  players: Set<string>
  ts: number
  source: JournalEntrySource
}
export interface journalPass {
  type: JournalEntryType
  id: number
  ts: number
  name: string
  modifiers: Set<string>
  source: JournalEntrySource
}

export interface journalPlayer {
  type: JournalEntryType
  id: number
  ts: number
  name: string
  source: JournalEntrySource
}

export interface journalAction {
  type: JournalEntryType
  id: number
  name: string
  terminal: boolean
  ts: number
  source: JournalEntrySource
}

export interface journalComment {
  type: JournalEntryType
  id: number
  name: string
  ts: number
  source: JournalEntrySource
  details: string
}
