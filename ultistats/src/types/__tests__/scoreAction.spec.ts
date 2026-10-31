import { describe, expect, it } from 'vitest'
import { JournalEntryType } from '@/types/journaltypes'
import { ACTION_IDS } from '@/types/catalogIds'
import { isActionRecord, isScoreActionRecord } from '@/types/scoreAction'

describe('action record ID matching', () => {
  it('matches default statistical actions by ID only', () => {
    expect(
      isActionRecord(
        { type: JournalEntryType.POSITIVE_ACTION, name: 'pa1' },
        ACTION_IDS.PICK_UP_DISC,
      ),
    ).toBe(true)
    expect(
      isActionRecord(
        { type: JournalEntryType.POSITIVE_ACTION, name: 'Pick up disc' },
        ACTION_IDS.PICK_UP_DISC,
      ),
    ).toBe(false)
    expect(
      isActionRecord(
        { type: JournalEntryType.POSITIVE_ACTION, name: ACTION_IDS.INTERCEPT },
        ACTION_IDS.INTERCEPT,
      ),
    ).toBe(true)
    expect(
      isActionRecord(
        { type: JournalEntryType.POSITIVE_ACTION, name: ACTION_IDS.BLOCK },
        ACTION_IDS.BLOCK,
      ),
    ).toBe(true)
  })

  it('continues to identify score actions by ID', () => {
    expect(
      isScoreActionRecord({
        type: JournalEntryType.POSITIVE_ACTION,
        name: ACTION_IDS.SCORE,
      }),
    ).toBe(true)
    expect(
      isScoreActionRecord({
        type: JournalEntryType.POSITIVE_ACTION,
        name: 'Score',
      }),
    ).toBe(false)
  })
})
