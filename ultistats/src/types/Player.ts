export interface Player {
  id: string
  name: string
  isActive: boolean
  modifiers?: Set<string>
  key_code?: string
  number?: number
}
