import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ScoreEvolution from '../ScoreEvolution.vue'
import { useJournalStore } from '@/stores/journal'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'
import { useActionsStore } from '@/stores/ActionsStore'
import { useTeamStore } from '@/stores/Team'

describe('ScoreEvolution', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const data =
          url === '/teams.json'
            ? [
                { id: 't0', name: 'Home', players: [{ id: 'p1', name: 'Player One' }] },
                { id: 't1', name: 'Away', players: [] },
              ]
            : url === '/actions/positive_actions.json'
              ? [{ name: 'Score', terminal: true }]
              : []

        return Promise.resolve({
          ok: true,
          json: async () => data,
        })
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('updates the displayed score when a score action is recorded', async () => {
    const journalStore = useJournalStore()
    const actionsStore = useActionsStore()
    const teamStore = useTeamStore()
    const wrapper = mount(ScoreEvolution, {
      global: { provide: { videoPlayerRef: ref(null) } },
    })
    await vi.waitFor(() => expect(wrapper.text()).toContain('BTR: 0 - 0 ADV'))
    await vi.waitFor(() => {
      expect(actionsStore.positiveActions).toHaveLength(1)
      expect(teamStore.teams[0].players).toHaveLength(1)
    })

    journalStore.addRecord({
      id: 1,
      name: 'pull',
      ts: 1,
      type: JournalEntryType.EVENT,
      source: JournalEntrySource.USER,
    })
    journalStore.addRecord({
      id: 2,
      name: 'p1',
      ts: 2,
      type: JournalEntryType.PLAYER,
      source: JournalEntrySource.USER,
    })
    journalStore.addRecord({
      id: 3,
      name: 'pa1',
      ts: 3,
      terminal: true,
      type: JournalEntryType.POSITIVE_ACTION,
      source: JournalEntrySource.USER,
    })

    await vi.waitFor(() => expect(wrapper.text()).toContain('BTR: 1 - 0 ADV'))
    wrapper.unmount()
  })
})
