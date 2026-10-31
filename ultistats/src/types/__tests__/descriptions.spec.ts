import { describe, expect, it } from 'vitest'
import { getDescriptionTooltip } from '../descriptions'

describe('getDescriptionTooltip', () => {
  it('uses the description when it is provided', () => {
    expect(getDescriptionTooltip('The player throws a long pass.')).toBe(
      'The player throws a long pass.',
    )
  })

  it('uses the fallback for empty descriptions', () => {
    expect(getDescriptionTooltip('')).toBe('No description')
    expect(getDescriptionTooltip('   ')).toBe('No description')
    expect(getDescriptionTooltip()).toBe('No description')
  })
})
