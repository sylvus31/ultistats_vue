import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StatsViewer from '../StatsViewer.vue'
import { useJournalStore } from '@/stores/journal'
import { getPassModifierId } from '@/types/passModifiers'
import { ACTION_IDS } from '@/types/catalogIds'
import { useStateStore } from '@/stores/StateStore'

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
                  players: [
                    { id: 'p1', name: 'Player One' },
                    { id: 'p4', name: 'Player Four' },
                  ],
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

  it('shows overall and long-pass completion rates and dashes when there are no attempts', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()
    const longModifier = getPassModifierId('long')

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player Three'))
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p4')
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set([longModifier]))
    journalStore.addPlayerEntry('p2')
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p4')
    journalStore.addPlayerEntry('p4')
    journalStore.addPassEntry('pass', new Set([longModifier]))
    journalStore.addPlayerEntry('p1')

    await vi.waitFor(() => {
      const headers = wrapper.findAll('thead th').map((header) => header.text())
      const overallRateColumn = headers.indexOf('P success rate')
      const longRateColumn = headers.indexOf('L success rate')
      const rows = wrapper.findAll('tbody tr')
      const playerOne = rows.find((row) => row.find('td').text() === 'Player One')
      const playerThree = rows.find((row) => row.find('td').text() === 'Player Three')
      const playerFour = rows.find((row) => row.find('td').text() === 'Player Four')

      expect(overallRateColumn).toBeGreaterThan(-1)
      expect(longRateColumn).toBeGreaterThan(-1)
      expect(playerOne?.findAll('td')[overallRateColumn].text()).toBe('66.7%')
      expect(playerOne?.findAll('td')[longRateColumn].text()).toBe('0.0%')
      expect(playerFour?.findAll('td')[longRateColumn].text()).toBe('100.0%')
      expect(playerThree?.findAll('td')[overallRateColumn].text()).toBe('--')
      expect(playerThree?.findAll('td')[longRateColumn].text()).toBe('--')
    })

    wrapper.unmount()
  })

  it('averages time in hand only for catches followed by a pass', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()
    useStateStore().statsScope = 2
    const addAt = (ts: number, addEntry: () => void) => {
      addEntry()
      const records = journalStore.sortedRecords
      const addedRecord = records.reduce((latest, record) => (record.id > latest.id ? record : latest))
      addedRecord.ts = ts
    }

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player Three'))
    addAt(10, () => journalStore.addPlayerEntry('p1'))
    addAt(16, () => journalStore.addPassEntry('pass', new Set()))
    addAt(17, () => journalStore.addPlayerEntry('p4'))
    addAt(20, () => journalStore.addPlayerEntry('p4'))
    addAt(22, () => journalStore.addActionEntry(ACTION_IDS.SCORE, true))
    addAt(30, () => journalStore.addPlayerEntry('p2'))
    addAt(32, () => journalStore.addActionEntry(ACTION_IDS.DROP, false))
    addAt(34, () => journalStore.addPassEntry('pass', new Set()))
    addAt(35, () => journalStore.addPlayerEntry('p3'))
    addAt(40, () => journalStore.addPassEntry('pass', new Set()))
    addAt(41, () => journalStore.addPlayerEntry('p4'))
    addAt(50, () => journalStore.addPlayerEntry('p4'))
    addAt(52, () => journalStore.addActionEntry(ACTION_IDS.PULL, true))
    addAt(54, () => journalStore.addPassEntry('pass', new Set()))
    addAt(55, () => journalStore.addPlayerEntry('p1'))
    addAt(59, () => journalStore.addPassEntry('pass', new Set()))
    addAt(60, () => journalStore.addPlayerEntry('p3'))

    await vi.waitFor(() => {
      const headers = wrapper.findAll('thead th').map((header) => header.text())
      const timeInHandColumn = headers.indexOf('Time in Hand')
      const rows = wrapper.findAll('tbody tr')
      const playerOne = rows.find((row) => row.find('td').text() === 'Player One')
      const playerTwo = rows.find((row) => row.find('td').text() === 'Player Two')
      const playerThree = rows.find((row) => row.find('td').text() === 'Player Three')
      const playerFour = rows.find((row) => row.find('td').text() === 'Player Four')
      const homeTeam = rows.find((row) => row.find('td').text() === 'Home')

      expect(timeInHandColumn).toBeGreaterThan(-1)
      expect(playerOne?.findAll('td')[timeInHandColumn].text()).toBe('00:05')
      expect(playerTwo?.findAll('td')[timeInHandColumn].text()).toBe('--')
      expect(playerThree?.findAll('td')[timeInHandColumn].text()).toBe('00:05')
      expect(playerFour?.findAll('td')[timeInHandColumn].text()).toBe('--')
      expect(homeTeam?.findAll('td')[timeInHandColumn].text()).toBe('00:05')
    })

    wrapper.unmount()
  })
})
