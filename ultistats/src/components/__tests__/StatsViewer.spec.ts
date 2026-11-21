import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StatsViewer from '../StatsViewer.vue'
import { useJournalStore } from '@/stores/journal'
import { getPassModifierId } from '@/types/passModifiers'
import { ACTION_IDS } from '@/types/catalogIds'
import { useStateStore } from '@/stores/StateStore'
import { usePassesStore } from '@/stores/passesStore'

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

    await playerOne?.trigger('click')
    const homeTeam = wrapper.findAll('.player-name').find((name) => name.text() === 'Home')
    await homeTeam?.trigger('click')
    await wrapper.find('[aria-label="Search passes attempted by Player One"]').trigger('click')
    await wrapper.find('[aria-label="Search successful passes for Player One"]').trigger('click')
    await wrapper.find('[aria-label="Search failed passes for Player One"]').trigger('click')
    await wrapper
      .find('[aria-label="Search successful long passes for Player One"]')
      .trigger('click')
    await wrapper.find('[aria-label="Search failed long passes for Player One"]').trigger('click')
    await wrapper.find('[aria-label="Search score-leading passes by Player One"]').trigger('click')
    await wrapper
      .find('[aria-label="Search one-pass-earlier score-leading passes by Player One"]')
      .trigger('click')
    await wrapper
      .find('[aria-label="Search two-passes-earlier score-leading passes by Player One"]')
      .trigger('click')
    expect(wrapper.emitted('select-search')).toEqual([
      [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'player-occurrence' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
          ],
        },
      ],
      [
        {
          subjectId: 't0',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'player-occurrence' },
            { field: 'playerId', operator: 'in', value: ['t0', 'p1', 'p4'] },
          ],
        },
      ],
      [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'pass-attempt' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
          ],
        },
      ],
      [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'pass-attempt' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
            { field: 'outcome', operator: 'equals', value: 'completed' },
          ],
        },
      ],
      [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'pass-attempt' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
            { field: 'outcome', operator: 'equals', value: 'failed' },
          ],
        },
      ],
      [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'pass-attempt' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
            { field: 'isLong', operator: 'equals', value: true },
            { field: 'outcome', operator: 'equals', value: 'completed' },
          ],
        },
      ],
      [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'pass-attempt' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
            { field: 'isLong', operator: 'equals', value: true },
            { field: 'outcome', operator: 'equals', value: 'failed' },
          ],
        },
      ],
      ...[0, 1, 2].map((level) => [
        {
          subjectId: 'p1',
          criteria: [
            { field: 'kind', operator: 'equals', value: 'score-assist' },
            { field: 'playerId', operator: 'in', value: ['p1'] },
            { field: 'level', operator: 'equals', value: level },
          ],
        },
      ]),
    ])

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

  it('counts direct and preceding score-leading passes by assist level', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player Four'))
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p4')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p4')
    journalStore.addActionEntry(ACTION_IDS.SCORE, true)

    await vi.waitFor(() => {
      expect(wrapper.find('[aria-label="Search score-leading passes by Player One"]').text()).toBe(
        '1',
      )
      expect(
        wrapper
          .find('[aria-label="Search one-pass-earlier score-leading passes by Player Four"]')
          .text(),
      ).toBe('1')
      expect(
        wrapper
          .find('[aria-label="Search two-passes-earlier score-leading passes by Player One"]')
          .text(),
      ).toBe('1')
    })

    wrapper.unmount()
  })

  it('shows pass names instead of pass ids in the pass type statistics', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()
    usePassesStore().setPasses([{ id: 'pass-id', name: 'Forehand', isActive: true }])

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player Three'))
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass-id', new Set())
    journalStore.addPlayerEntry('p4')

    await vi.waitFor(() => {
      const playerOneRow = wrapper
        .findAll('tbody tr')
        .find((row) => row.find('td').text() === 'Player One')

      expect(playerOneRow?.text()).toContain('Forehand: 1')
      expect(playerOneRow?.text()).not.toContain('pass-id')
    })

    wrapper.unmount()
  })

  it('counts explicit passes without a receiver as attempts and includes them in success-rate denominators', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()
    const longModifier = getPassModifierId('long')
    useStateStore().statsScope = 2

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player One'))
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set([longModifier]))
    journalStore.addActionEntry(ACTION_IDS.DROP, false)
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set([longModifier]))

    await vi.waitFor(() => {
      const headers = wrapper.findAll('thead th').map((header) => header.text())
      const rows = wrapper.findAll('tbody tr')
      const playerOne = rows.find((row) => row.find('td').text() === 'Player One')
      const cells = playerOne?.findAll('td')

      expect(cells?.[headers.indexOf('P total')].text()).toBe('2')
      expect(cells?.[headers.indexOf('P success')].text()).toBe('0')
      expect(cells?.[headers.indexOf('P success rate')].text()).toBe('0.0%')
      expect(cells?.[headers.indexOf('P fail')].text()).toBe('1')
      expect(cells?.[headers.indexOf('L success rate')].text()).toBe('0.0%')
    })

    wrapper.unmount()
  })

  it('counts providers only for passes between teammates', async () => {
    const wrapper = mount(StatsViewer)
    const journalStore = useJournalStore()

    await vi.waitFor(() => expect(wrapper.text()).toContain('Player Three'))
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p2')
    journalStore.addPlayerEntry('p1')
    journalStore.addPassEntry('pass', new Set())
    journalStore.addPlayerEntry('p4')

    await vi.waitFor(() => {
      const headers = wrapper.findAll('thead th').map((header) => header.text())
      const providersColumn = headers.indexOf('Providers')
      const rows = wrapper.findAll('tbody tr')
      const playerTwo = rows.find((row) => row.find('td').text() === 'Player Two')
      const playerFour = rows.find((row) => row.find('td').text() === 'Player Four')

      expect(providersColumn).toBeGreaterThan(-1)
      expect(playerTwo?.findAll('td')[providersColumn].text()).toBe('')
      expect(playerFour?.findAll('td')[providersColumn].text()).toContain('Player One: 1')
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
      const addedRecord = records.reduce((latest, record) =>
        record.id > latest.id ? record : latest,
      )
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
