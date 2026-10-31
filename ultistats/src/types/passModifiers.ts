import { PASS_MODIFIER_IDS } from '@/types/catalogIds'

export type PassModifierKind = 'long' | 'break' | 'off-hand'

const passModifierIds: Record<PassModifierKind, string> = {
  long: PASS_MODIFIER_IDS.LONG,
  break: PASS_MODIFIER_IDS.BREAK,
  'off-hand': PASS_MODIFIER_IDS.OFF_HAND,
}

export function hasPassModifier(modifiers: ReadonlySet<string>, kind: PassModifierKind): boolean {
  return modifiers.has(passModifierIds[kind])
}

export function getPassModifierId(kind: PassModifierKind): string {
  return passModifierIds[kind]
}
