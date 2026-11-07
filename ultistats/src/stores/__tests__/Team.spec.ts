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

  it('determines a player team by membership rather than matching the team name', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players[0]?.name).toBe('Thomas'))
    teamStore.teams[0].players[0].name = 'ADVERSAIRE'

    expect(teamStore.getPlayerTeam(teamStore.teams[0].players[0])).toBe(0)
  })

  it('loads team colors with defaults and allows changing them', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].name).toBe('BTR'))

    expect(teamStore.teams[0].color).toBe('#00bcd4')
    expect(teamStore.teams[1].color).toBe('#b05959')

    teamStore.setTeamColor(1, '#123456')
    expect(teamStore.teams[1].color).toBe('#123456')
  })
})
