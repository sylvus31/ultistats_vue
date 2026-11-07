import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayerSelector from '../PlayerSelector.vue'
import { useKeyboardStore } from '@/stores/keyboardStore'
import { useTeamStore } from '@/stores/Team'

describe('PlayerSelector shortcuts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 't0',
            name: 'BTR',
            players: [
              { id: 'p1', name: 'Thomas', key_code: 'Numpad7' },
              { id: 'p2', name: 'Alex' },
            ],
          },
          { id: 't1', name: 'ADVERSAIRE', players: [] },
        ],
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('binds shortcuts when default players load and updates them when keys change', async () => {
    const wrapper = mount(PlayerSelector, { props: { onlyLinePlayers: false } })
    const keyboardStore = useKeyboardStore()
    const teamStore = useTeamStore()

    await vi.waitFor(() => {
      expect(keyboardStore.getKeyBinding('Numpad7')).toBe('playersSelectorShortcutManager')
    })
    expect(wrapper.text()).toContain('Thomas')
    expect(wrapper.text()).not.toContain('BTR')
    expect(wrapper.text()).not.toContain('ADVERSAIRE')

    teamStore.teams[0].players[0].key_code = 'Numpad6'

    await vi.waitFor(() => {
      expect(keyboardStore.getKeyBinding('Numpad7')).toBe('')
      expect(keyboardStore.getKeyBinding('Numpad6')).toBe('playersSelectorShortcutManager')
    })

    wrapper.unmount()
  })

  it('shows only players marked in the line by default and can show all roster players', async () => {
    const wrapper = mount(PlayerSelector)
    const teamStore = useTeamStore()

    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(2))
    expect(wrapper.text()).not.toContain('Thomas')
    expect(wrapper.text()).not.toContain('Alex')

    teamStore.setPlayingStatus('p1', true)
    await vi.waitFor(() => expect(wrapper.text()).toContain('Thomas'))
    expect(wrapper.text()).not.toContain('Alex')

    await wrapper.setProps({ onlyLinePlayers: false })
    expect(wrapper.text()).toContain('Thomas')
    expect(wrapper.text()).toContain('Alex')

    wrapper.unmount()
  })
})
