export interface journalPass {
  id: string
  ts: number
  name: string
  modifiers: Set<string>
}

export interface journalPlayer {
  id: string
  ts: number
  name: string
}
