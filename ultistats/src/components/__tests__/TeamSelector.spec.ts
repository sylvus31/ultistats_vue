import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TeamSelector from '../TeamSelector.vue'
import { useJournalStore } from '@/stores/journal'
import { useTeamStore } from '@/stores/Team'

describe('TeamSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 't0', name: 'BTR', players: [] },
          { id: 't1', name: 'ADVERSAIRE', players: [] },
        ],
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders team buttons and records the selected team', async () => {
    const wrapper = mount(TeamSelector)
    const teamStore = useTeamStore()
    const journalStore = useJournalStore()

    await vi.waitFor(() => expect(wrapper.text()).toContain('ADVERSAIRE'))
    const buttons = wrapper.findAll('sl-button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toContain('BTR')
    expect(buttons[0].text()).toContain('[T]')
    teamStore.getPlayerByID('t0')!.key_code = 'Numpad7'
    await vi.waitFor(() => expect(buttons[0].text()).toContain('[Numpad7]'))
    await buttons[0].trigger('click')

    expect(teamStore.getPlayerByID('t0')?.isActive).toBe(true)
    expect(journalStore.sortedRecords[0]).toMatchObject({ name: 't0', type: 'player' })
  })
})
