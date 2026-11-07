import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import JournalViewer from '../JournalViewer.vue'
import { useJournalStore } from '@/stores/journal'
import { useTeamStore } from '@/stores/Team'

describe('JournalViewer player colors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: async () => {
            if (url === '/teams.json') {
              return [
                { id: 't0', name: 'Home', players: [{ id: 'p1', name: 'Player One' }] },
                { id: 't1', name: 'Away', players: [{ id: 'p2', name: 'Player Two' }] },
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

  it('underlines journal player names using their team colors', async () => {
    const teamStore = useTeamStore()
    const journalStore = useJournalStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))
    journalStore.addPlayerEntry('p1')

    const wrapper = mount(JournalViewer)
    const playerName = wrapper.get('.player-name')

    expect(playerName.text()).toBe('Player One')
    expect((playerName.element as HTMLElement).style.textDecorationColor).toBe('#00bcd4')
    wrapper.unmount()
  })
})
