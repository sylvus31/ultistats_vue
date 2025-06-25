export enum JournalEntryType {
  PASS = 'pass',
  PLAYER = 'player',
  POSITIVE_ACTION = 'positiveAction',
  NEGATIVE_ACTION = 'negativeAction',
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
}
