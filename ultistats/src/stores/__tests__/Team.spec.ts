import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { isReactive } from 'vue'
import { useTeamStore } from '../Team'

describe('team shortcut players', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps team shortcut players reactive when their keys are edited', () => {
    const teamStore = useTeamStore()
    const teamShortcut = teamStore.players.find((player) => player.id === 't0')

    expect(teamShortcut).toBeDefined()
    expect(isReactive(teamShortcut)).toBe(true)

    if (teamShortcut) {
      teamShortcut.key_code = 'b'
    }

    expect(teamStore.players.find((player) => player.id === 't0')?.key_code).toBe('b')
  })
})
