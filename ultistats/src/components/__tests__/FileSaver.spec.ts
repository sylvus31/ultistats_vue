import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FileSaver from '../FileSaver.vue'
import { useTeamStore } from '@/stores/Team'

describe('FileSaver team colors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: async () =>
            url === '/teams.json'
              ? [
                  { id: 't0', name: 'YOUR TEAM', players: [] },
                  { id: 't1', name: 'OPPONENT', players: [] },
                ]
              : url === '/passes.json'
                ? { passes: [], passesModifiers: [] }
                : [],
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a color picker inside each team name field and updates its team color', async () => {
    const wrapper = mount(FileSaver)
    const teamStore = useTeamStore()

    await vi.waitFor(() => expect(teamStore.teams[0].name).toBe('YOUR TEAM'))
    const colorPickers = wrapper.findAll('.team-color-picker')

    expect(colorPickers).toHaveLength(2)
    expect(colorPickers[0].attributes('type')).toBe('color')
    expect(colorPickers[0].attributes('aria-label')).toBe('Choose YOUR TEAM color')
    expect(colorPickers[1].attributes('aria-label')).toBe('Choose opponent team color')

    await colorPickers[0].setValue('#123456')
    expect(teamStore.teams[0].color).toBe('#123456')

    await colorPickers[1].setValue('#abcdef')
    expect(teamStore.teams[1].color).toBe('#abcdef')
    wrapper.unmount()
  })
})
