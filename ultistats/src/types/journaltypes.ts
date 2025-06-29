export enum JournalEntryType {
  PASS = 'pass',
  PLAYER = 'player',
  POSITIVE_ACTION = 'positiveAction',
  NEGATIVE_ACTION = 'negativeAction',
  EVENT = 'event',
  LINE = 'line',
}

export interface journalLine {
  type: JournalEntryType
  name: string
  id: number
  players: Set<string>
  ts: number
}
export interface journalPass {
  type: JournalEntryType
  id: number
  ts: number
  name: string
  modifiers: Set<string>
}

export interface journalPlayer {
  type: JournalEntryType
  id: number
  ts: number
  name: string
}

export interface journalAction {
  type: JournalEntryType
  id: number
  name: string
  terminal: boolean
  ts: number
}
