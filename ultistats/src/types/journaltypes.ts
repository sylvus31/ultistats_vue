export enum JournalEntryType {
  PASS = 'pass',
  PLAYER = 'player',
}
export interface journalPass {
  type: JournalEntryType
  id: string
  ts: number
  name: string
  modifiers: Set<string>
}

export interface journalPlayer {
  type: JournalEntryType
  id: string
  ts: number
  name: string
}
