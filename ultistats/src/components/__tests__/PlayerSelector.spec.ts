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
            players: [{ id: 'p1', name: 'Thomas', key_code: 'Numpad7' }],
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
    const wrapper = mount(PlayerSelector)
    const keyboardStore = useKeyboardStore()
    const teamStore = useTeamStore()

    await vi.waitFor(() => {
      expect(keyboardStore.getKeyBinding('Numpad7')).toBe('playersSelectorShortcutManager')
    })

    teamStore.teams[0].players[0].key_code = 'Numpad6'

    await vi.waitFor(() => {
      expect(keyboardStore.getKeyBinding('Numpad7')).toBe('')
      expect(keyboardStore.getKeyBinding('Numpad6')).toBe('playersSelectorShortcutManager')
    })

    wrapper.unmount()
  })
})
