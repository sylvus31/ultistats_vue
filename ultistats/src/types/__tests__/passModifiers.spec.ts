import { describe, expect, it } from 'vitest'
import { getConfiguredPassModifierName, hasPassModifier } from '../passModifiers'

describe('pass modifier names', () => {
  it.each(['Long', 'long', 'longue', 'LONGUE'])('recognizes %s as the long modifier', (name) => {
    expect(hasPassModifier(new Set([name]), 'long')).toBe(true)
  })

  it.each(['Break', 'break', 'BREAK'])('recognizes %s as the break modifier', (name) => {
    expect(hasPassModifier(new Set([name]), 'break')).toBe(true)
  })

  it('uses the configured modifier name and supports legacy save names', () => {
    expect(
      getConfiguredPassModifierName(
        [
          { id: 'long', name: 'Long', isActive: false },
          { id: 'break', name: 'Break', isActive: false },
        ],
        'long',
      ),
    ).toBe('Long')
    expect(hasPassModifier(new Set(['longue', 'break']), 'long')).toBe(true)
  })
})
