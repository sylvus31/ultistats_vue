export interface Player {
  id: string
  name: string
  isActive: boolean
  modifiers?: Set<string>
  key_code?: string
  number?: number
  playing: boolean
}
export const createPlayer = (
  id: string,
  name: string,
  key_code?: string,
  modifiers?: Set<string>,
  number?: number,
): Player => {
  return {
    id: id,
    name: name,
    isActive: false,
    playing: false,
    modifiers: modifiers,
    number: number,
    key_code: key_code,
  }
}
