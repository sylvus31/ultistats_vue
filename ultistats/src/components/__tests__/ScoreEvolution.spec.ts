import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ScoreEvolution from '../ScoreEvolution.vue'
import { useJournalStore } from '@/stores/journal'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'
import { useActionsStore } from '@/stores/ActionsStore'
import { useTeamStore } from '@/stores/Team'
import { useStateStore } from '@/stores/StateStore'

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
              ? [
                  { id: 'pa4', name: 'Score' },
                  { id: 'pa5', name: 'Pull' },
                ]
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

  it('displays the team store names and updates the score when a score action is recorded', async () => {
    const journalStore = useJournalStore()
    const actionsStore = useActionsStore()
    const teamStore = useTeamStore()
    const stateStore = useStateStore()
    const videoPlayerRef = ref({ elapsedTimeValue: 1, goTo: vi.fn() })
    const wrapper = mount(ScoreEvolution, {
      global: { provide: { videoPlayerRef } },
    })
    await vi.waitFor(() => {
      expect(actionsStore.positiveActions).toHaveLength(2)
      expect(teamStore.teams[0].players).toHaveLength(1)
    })
    teamStore.teams[0].name = 'Falcons'
    teamStore.teams[1].name = 'Wolves'
    await vi.waitFor(() => expect(wrapper.text()).toContain('Falcons: 0 - 0 Wolves'))

    journalStore.addRecord({
      id: 1,
      name: 'pa5',
      ts: 1,
      type: JournalEntryType.POSITIVE_ACTION,
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
      name: 'pa4',
      ts: 3,
      type: JournalEntryType.POSITIVE_ACTION,
      source: JournalEntrySource.USER,
    })

    await vi.waitFor(() => expect(wrapper.text()).toContain('Falcons: 1 - 0 Wolves'))

    journalStore.addRecord({
      id: 4,
      name: 'pa5',
      ts: 4,
      type: JournalEntryType.POSITIVE_ACTION,
      source: JournalEntrySource.USER,
    })
    journalStore.addRecord({
      id: 5,
      name: 'p1',
      ts: 5,
      type: JournalEntryType.PLAYER,
      source: JournalEntrySource.USER,
    })

    await vi.waitFor(() => expect(wrapper.findAll('.score-circle')).toHaveLength(2))
    expect(wrapper.findAll('.current-point-indicator')).toHaveLength(1)
    expect(wrapper.findAll('.score-circle')[0]?.find('.current-point-indicator').exists()).toBe(
      true,
    )

    await wrapper.findAll('.score-circle')[1]?.trigger('click')
    await vi.waitFor(() => expect(stateStore.pointIndex).toBe(1))
    expect(wrapper.findAll('.current-point-indicator')).toHaveLength(1)
    expect(wrapper.findAll('.score-circle')[1]?.find('.current-point-indicator').exists()).toBe(
      true,
    )

    videoPlayerRef.value.elapsedTimeValue = 1.5
    await vi.waitFor(() => expect(stateStore.pointIndex).toBe(0))
    expect(wrapper.findAll('.score-circle')[0]?.find('.current-point-indicator').exists()).toBe(
      true,
    )

    videoPlayerRef.value.elapsedTimeValue = 4.5
    await vi.waitFor(() => expect(stateStore.pointIndex).toBe(1))
    expect(wrapper.findAll('.score-circle')[1]?.find('.current-point-indicator').exists()).toBe(
      true,
    )
    wrapper.unmount()
  })
})
