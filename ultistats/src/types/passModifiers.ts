import type { passModifier } from '@/types/Passes'

export type PassModifierKind = 'long' | 'break' | 'off-hand'

export function getPassModifierKind(name: string): PassModifierKind | undefined {
  const normalizedName = name.trim().toLowerCase()
  if (normalizedName === 'long' || normalizedName === 'longue') return 'long'
  if (normalizedName === 'break') return 'break'
  if (normalizedName === 'off-hand') return 'off-hand'
  return undefined
}

export function hasPassModifier(modifiers: ReadonlySet<string>, kind: PassModifierKind): boolean {
  return [...modifiers].some((modifier) => getPassModifierKind(modifier) === kind)
}

export function getConfiguredPassModifierName(
  modifiers: passModifier[],
  kind: PassModifierKind,
): string {
  const configuredModifier = modifiers.find(
    (modifier) => getPassModifierKind(modifier.name) === kind,
  )
  if (configuredModifier) return configuredModifier.name

  if (kind === 'long') return 'longue'
  if (kind === 'off-hand') return 'Off-hand'
  return 'break'
}
