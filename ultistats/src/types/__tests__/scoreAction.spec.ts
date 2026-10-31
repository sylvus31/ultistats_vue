import { describe, expect, it } from 'vitest'
import { JournalEntryType } from '@/types/journaltypes'
import { isActionRecordNamed, isScoreActionRecord } from '@/types/scoreAction'

describe('action record name matching', () => {
  const actions = {
    getActionByID: (id: string) => {
      const byId: Record<string, { name: string }> = {
        pa1: { name: 'Pick up disc' },
        pa4: { name: 'Score' },
      }
      return byId[id]
    },
  }

  it('resolves action IDs and ignores name casing', () => {
    expect(
      isActionRecordNamed(
        { type: JournalEntryType.POSITIVE_ACTION, name: 'pa1' },
        actions,
        'pick up disc',
      ),
    ).toBe(true)
    expect(
      isActionRecordNamed(
        { type: JournalEntryType.POSITIVE_ACTION, name: 'Pick up disc' },
        actions,
        'PICK UP DISC',
      ),
    ).toBe(true)
  })

  it('continues to identify score actions by ID', () => {
    expect(
      isScoreActionRecord({ type: JournalEntryType.POSITIVE_ACTION, name: 'pa4' }, actions),
    ).toBe(true)
  })
})
