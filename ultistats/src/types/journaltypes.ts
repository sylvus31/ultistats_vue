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
  type: JournalEntryType.LINE
  name: string
  id: number
  players: Set<string>
  ts: number
  source: JournalEntrySource
}
export interface journalPass {
  type: JournalEntryType.PASS
  id: number
  ts: number
  name: string
  modifiers: Set<string>
  source: JournalEntrySource
}

export interface journalPlayer {
  type: JournalEntryType.PLAYER
  id: number
  ts: number
  name: string
  source: JournalEntrySource
}

export interface journalAction {
  type: JournalEntryType.POSITIVE_ACTION | JournalEntryType.NEGATIVE_ACTION
  id: number
  name: string
  ts: number
  source: JournalEntrySource
}

export interface journalComment {
  type: JournalEntryType.COMMENT
  id: number
  name: string
  ts: number
  source: JournalEntrySource
  details: string
}

export interface journalEvent {
  type: JournalEntryType.EVENT
  id: number
  ts: number
  name: string
  source: JournalEntrySource
}
