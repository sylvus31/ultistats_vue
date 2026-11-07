import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StatsViewer from '../StatsViewer.vue'
import { useJournalStore } from '@/stores/journal'

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
                  players: [
                    { id: 'p2', name: 'Player Two' },
                    { id: 'p3', name: 'Player Three' },
                  ],
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

  it('counts passes between players on the away team in the away team summary', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player Three'))
    journalStore.addPlayerEntry('p2')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p3')

    await vi.waitFor(() => {
      const teamRows = wrapper.findAll('tbody tr').filter((row) => {
        const label = row.find('td').text()
        return label === 'Home' || label === 'Away'
      })
      expect(teamRows).toHaveLength(2)
      const homeCells = teamRows.find((row) => row.find('td').text() === 'Home')!.findAll('td')
      const awayCells = teamRows.find((row) => row.find('td').text() === 'Away')!.findAll('td')
      expect(homeCells[1].text()).toBe('0')
      expect(awayCells[1].text()).toBe('1')
      expect(awayCells[2].text()).toBe('1')
    })

    wrapper.unmount()
  })
})
