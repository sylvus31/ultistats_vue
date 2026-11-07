import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LineSelector from '../LineSelector.vue'

describe('LineSelector player team colors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 't0', name: 'Home', players: [{ id: 'p1', name: 'Player One' }] },
          { id: 't1', name: 'Away', players: [{ id: 'p2', name: 'Player Two' }] },
        ],
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('underlines player names using their team colors', async () => {
    const wrapper = mount(LineSelector, { props: { modelValue: new Set<string>() } })

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player One'))
    const playerOne = wrapper.findAll('.player-name').find((name) => name.text() === 'Player One')
    const playerTwo = wrapper.findAll('.player-name').find((name) => name.text() === 'Player Two')

    expect((playerOne?.element as HTMLElement | undefined)?.style.textDecorationColor).toBe(
      '#00bcd4',
    )
    expect((playerTwo?.element as HTMLElement | undefined)?.style.textDecorationColor).toBe(
      '#b05959',
    )
    wrapper.unmount()
  })
})
