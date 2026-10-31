import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StatsViewer from '../StatsViewer.vue'

describe('StatsViewer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const data =
          url === '/teams.json'
            ? [
                {
                  id: 't0',
                  name: 'Home',
                  players: [{ id: 'p1', name: 'Player One' }],
                },
                {
                  id: 't1',
                  name: 'Away',
                  players: [{ id: 'p2', name: 'Player Two' }],
                },
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

  it('lists players when the default teams load asynchronously', async () => {
    const wrapper = mount(StatsViewer)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Player One')
      expect(wrapper.text()).toContain('Player Two')
    })

    wrapper.unmount()
  })
})
