import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
import { ACTION_IDS } from '@/types/catalogIds'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'
import { useJournalStore } from '../journal'

describe('journal store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('tracks journal edits until they are marked saved', () => {
    const journalStore = useJournalStore()

    expect(journalStore.hasUnsavedChanges).toBe(false)

    journalStore.addCommentEntry('Note', 'Details')
    expect(journalStore.hasUnsavedChanges).toBe(true)

    journalStore.markSaved()
    expect(journalStore.hasUnsavedChanges).toBe(false)

    journalStore.deleteRecord(journalStore.sortedRecords[0]!)
    expect(journalStore.hasUnsavedChanges).toBe(true)
  })

  it('returns the latest journal entry strictly before the video time', () => {
    const journalStore = useJournalStore()
    journalStore.addRecord({
      id: 1,
      name: 'Earlier',
      ts: 4,
      type: JournalEntryType.COMMENT,
      source: JournalEntrySource.USER,
      details: '',
    })
    journalStore.addRecord({
      id: 2,
      name: 'Later',
      ts: 9,
      type: JournalEntryType.COMMENT,
      source: JournalEntrySource.USER,
      details: '',
    })

    expect(journalStore.getLastEntryBeforeTs(12)?.name).toBe('Later')
    expect(journalStore.getLastEntryBeforeTs(9)?.name).toBe('Earlier')
    expect(journalStore.getLastEntryBeforeTs(4)).toBeNull()
  })

  it.each([
    ['pull', ACTION_IDS.PULL],
    ['block', ACTION_IDS.BLOCK],
  ])('does not add a default pass after a %s', (_action, actionId) => {
    const journalStore = useJournalStore()
    journalStore.addRecord({
      id: 1,
      name: 'player-1',
      ts: 1,
      type: JournalEntryType.PLAYER,
      source: JournalEntrySource.USER,
    })
    journalStore.addRecord({
      id: 2,
      name: actionId,
      ts: 2,
      type: JournalEntryType.POSITIVE_ACTION,
      source: JournalEntrySource.USER,
    })
    journalStore.setVideoPlayerRef(
      ref({ elapsedTimeValue: 3 } as VideoPlayerInstance),
    )

    journalStore.addPlayerEntry('player-2')

    expect(journalStore.sortedRecords).toHaveLength(3)
    expect(journalStore.sortedRecords.some((record) => record.type === JournalEntryType.PASS)).toBe(
      false,
    )
  })
})
