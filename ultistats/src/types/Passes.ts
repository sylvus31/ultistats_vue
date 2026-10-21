export interface Pass {
  id: string
  name: string
  isActive: boolean
  key?: string
  modifiers?: Set<passModifier>
}

export interface passModifier {
  id: string
  name: string
  isActive: boolean
  key?: string
}
