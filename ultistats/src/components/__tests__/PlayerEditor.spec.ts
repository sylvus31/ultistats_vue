import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayerEditor from '../PlayerEditor.vue'
import { useTeamStore } from '@/stores/Team'

describe('PlayerEditor team shortcuts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 't0', name: 'BTR', players: [{ id: 'p1', name: 'Thomas' }] },
          { id: 't1', name: 'ADVERSAIRE', players: [] },
        ],
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows team shortcuts first with read-only names and a lighter row background', async () => {
    const wrapper = mount(PlayerEditor)
    const teamStore = useTeamStore()

    await vi.waitFor(() => expect(teamStore.teams[1].name).toBe('ADVERSAIRE'))
    const rows = wrapper.findAll('tbody tr')

    expect(rows[0].find('sl-input').attributes('data-player-id')).toBe('t0')
    expect(rows[1].find('sl-input').attributes('data-player-id')).toBe('t1')
    expect(rows[0].classes()).toContain('team-shortcut-row')
    expect(rows[1].classes()).toContain('team-shortcut-row')
    expect(
      (rows[0].find('sl-input').element as HTMLElement & { readonly: boolean }).readonly,
    ).toBe(true)
    expect(
      (rows[1].find('sl-input').element as HTMLElement & { readonly: boolean }).readonly,
    ).toBe(true)
    expect(rows[0].find('.remove-entry').exists()).toBe(false)
    expect(rows[1].find('.remove-entry').exists()).toBe(false)
    expect(rows[2].find('sl-input').attributes('data-player-id')).toBe('p1')
    expect(
      (rows[2].find('sl-input').element as HTMLElement & { readonly?: boolean }).readonly,
    ).toBe(false)

    wrapper.unmount()
  })
})
