import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useJournalStore } from '../journal'

describe('journal unsaved changes', () => {
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
})
