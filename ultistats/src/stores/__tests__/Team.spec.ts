import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { isReactive } from 'vue'
import { useTeamStore } from '../Team'

describe('team shortcut players', () => {
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
              {
                id: 'p1',
                name: 'Thomas',
                key_code: 'Numpad7',
                modifiers: [],
              },
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

  it('loads default teams and keeps team shortcut players reactive when their keys are edited', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players[0]?.name).toBe('Thomas'))
    const teamShortcut = teamStore.players.find((player) => player.id === 't0')

    expect(teamShortcut).toBeDefined()
    expect(isReactive(teamShortcut)).toBe(true)

    if (teamShortcut) {
      teamShortcut.key_code = 'b'
    }

    expect(teamStore.players.find((player) => player.id === 't0')?.key_code).toBe('b')
  })
})
