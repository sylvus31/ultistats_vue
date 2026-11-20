import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import TimerOverlay from '../TimerOverlay.vue'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'
import { useJournalStore } from '@/stores/journal'
import { useActionsStore } from '@/stores/ActionsStore'
import { useTeamStore } from '@/stores/Team'
import { ActionType } from '@/types/ActionsType'
import { createPlayer } from '@/types/Player'

describe('TimerOverlay', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: async () => {
            if (url === '/teams.json') {
              return [
                { id: 't0', name: 'Home', players: [] },
                { id: 't1', name: 'Away', players: [] },
              ]
            }
            if (url === '/passes.json') return { passes: [], passesModifiers: [] }
            return []
          },
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows player and action names and resets when there is no earlier entry', async () => {
    const journalStore = useJournalStore()
    const teamStore = useTeamStore()
    teamStore.teams[0].players.push(createPlayer('player-1', 'Player One'))
    const actionsStore = useActionsStore()
    actionsStore.setActions(
      [{ id: 'action-1', name: 'Action One', type: ActionType.POSITIVE }],
      [],
    )
    journalStore.addRecord({
      id: 1,
      name: 'player-1',
      ts: 2,
      type: JournalEntryType.PLAYER,
      source: JournalEntrySource.USER,
    })
    const wrapper = mount(TimerOverlay, { global: { plugins: [pinia] } })

    wrapper.vm.setVideoTime(7.5)
    await nextTick()
    expect(wrapper.text()).toContain('Player One : 05.50')

    journalStore.sortedRecords[0]!.name = 'action-1'
    journalStore.sortedRecords[0]!.type = JournalEntryType.POSITIVE_ACTION
    wrapper.vm.setVideoTime(7.5)
    await nextTick()
    expect(wrapper.text()).toContain('Action One : 05.50')

    wrapper.vm.setVideoTime(2)
    await nextTick()
    expect(wrapper.text()).toContain('? : 00.00')
  })
})
