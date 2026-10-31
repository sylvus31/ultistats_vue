import { describe, expect, it } from 'vitest'
import { PASS_MODIFIER_IDS } from '../catalogIds'
import { getPassModifierId, hasPassModifier } from '../passModifiers'

describe('pass modifier IDs', () => {
  it('recognizes the long modifier by ID only', () => {
    expect(hasPassModifier(new Set([PASS_MODIFIER_IDS.LONG]), 'long')).toBe(true)
    expect(hasPassModifier(new Set(['Long']), 'long')).toBe(false)
  })

  it('recognizes the break modifier by ID', () => {
    expect(hasPassModifier(new Set([PASS_MODIFIER_IDS.BREAK]), 'break')).toBe(true)
  })

  it('returns the configured modifier ID for journal toggles', () => {
    expect(getPassModifierId('long')).toBe('pm1')
    expect(getPassModifierId('off-hand')).toBe('pm3')
  })
})
