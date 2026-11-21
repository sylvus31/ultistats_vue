import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayerSearch from '../PlayerSearch.vue'
import { useActionsStore } from '@/stores/ActionsStore'
import { useEventsStore } from '@/stores/EventsStore'
import { useJournalStore, type JournalEntry } from '@/stores/journal'
import { usePassesStore } from '@/stores/passesStore'
import { useStateStore } from '@/stores/StateStore'
import { useTeamStore } from '@/stores/Team'
import { ActionType } from '@/types/ActionsType'
import { ACTION_IDS } from '@/types/catalogIds'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'
import { createStatSearchRequest } from '@/stats/statEvents'
import { getPassModifierId } from '@/types/passModifiers'
import { createPlayer } from '@/types/Player'

describe('PlayerSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: async () => {
            if (url === '/teams.json') {
              return [
                { id: 't0', name: 'Home', players: [{ id: 'p1', name: 'Player One' }] },
                { id: 't1', name: 'Away', players: [{ id: 'p2', name: 'Player Two' }] },
              ]
            }
            if (url === '/passes.json') return { passes: [], passesModifiers: [] }
            return []
          },
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows player occurrences with neighboring records and seeks three seconds early', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))

    usePassesStore().setPasses([{ id: 'pass', name: 'Forehand', isActive: true }])
    useActionsStore().setActions([{ id: 'goal', name: 'Goal', type: ActionType.POSITIVE }], [])
    useEventsStore().setEvents([])

    const journalStore = useJournalStore()
    const records: JournalEntry[] = [
      {
        id: 1,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 5,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
      {
        id: 2,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 10,
        source: JournalEntrySource.USER,
      },
      {
        id: 3,
        type: JournalEntryType.POSITIVE_ACTION,
        name: 'goal',
        ts: 12,
        source: JournalEntrySource.USER,
      },
      {
        id: 4,
        type: JournalEntryType.PLAYER,
        name: 't0',
        ts: 15,
        source: JournalEntrySource.USER,
      },
      {
        id: 5,
        type: JournalEntryType.PLAYER,
        name: 'p2',
        ts: 17,
        source: JournalEntrySource.USER,
      },
      {
        id: 6,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 20,
        source: JournalEntrySource.USER,
      },
    ]
    records.forEach((record) => journalStore.addRecord(record))

    const goTo = vi.fn()
    const play = vi.fn()
    const wrapper = mount(PlayerSearch, {
      props: { videoPlayer: { goTo, play } },
    })

    const playerButtons = wrapper.findAll('.player-buttons sl-button')
    expect(playerButtons.map((button) => button.text())).toEqual(['Player One', 'Player Two'])
    expect(
      playerButtons[0].get<HTMLElement>('.player-name').element.style.textDecorationColor,
    ).toBe('#00bcd4')

    await playerButtons[0].trigger('click')

    const results = wrapper.findAll('.result-entry')
    expect(results).toHaveLength(2)
    expect(results[0].text()).toContain('Forehand')
    expect(results[0].text()).toContain('Player One')
    expect(results[0].text()).toContain('Goal')
    expect(results[1].text()).toContain('Player Two')
    expect(results[1].text()).toContain('Player One')
    expect(results[1].text()).toContain('—')

    await results[0].trigger('click')
    expect(goTo).toHaveBeenCalledWith(7)
    expect(play).toHaveBeenCalled()
  })

  it('shows roster and team-ID occurrences when selected from the stats table', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))

    const journalStore = useJournalStore()
    const records: JournalEntry[] = [
      {
        id: 1,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 5,
        source: JournalEntrySource.USER,
      },
      {
        id: 2,
        type: JournalEntryType.PLAYER,
        name: 't0',
        ts: 10,
        source: JournalEntrySource.USER,
      },
      {
        id: 3,
        type: JournalEntryType.PLAYER,
        name: 'p2',
        ts: 15,
        source: JournalEntrySource.USER,
      },
    ]
    records.forEach((record) => journalStore.addRecord(record))

    const wrapper = mount(PlayerSearch, {
      props: {
        videoPlayer: null,
        searchRequest: createStatSearchRequest('player-occurrence', 't0', ['t0', 'p1']),
      },
    })

    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(2))
    expect(wrapper.findAll('.result-entry').map((entry) => entry.find('strong').text())).toEqual([
      'Player One',
      'Home',
    ])

    wrapper.unmount()
  })

  it('shows only pass-attempt records matching the selected criteria', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))

    usePassesStore().setPasses([{ id: 'pass', name: 'Forehand', isActive: true }])
    const journalStore = useJournalStore()
    const records: JournalEntry[] = [
      {
        id: 1,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 5,
        source: JournalEntrySource.USER,
      },
      {
        id: 2,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 6,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
      {
        id: 3,
        type: JournalEntryType.PLAYER,
        name: 'p2',
        ts: 7,
        source: JournalEntrySource.USER,
      },
      {
        id: 4,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 8,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
      {
        id: 5,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 9,
        source: JournalEntrySource.USER,
      },
      {
        id: 6,
        type: JournalEntryType.PLAYER,
        name: 't0',
        ts: 10,
        source: JournalEntrySource.USER,
      },
      {
        id: 7,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 11,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
    ]
    records.forEach((record) => journalStore.addRecord(record))

    const wrapper = mount(PlayerSearch, {
      props: {
        videoPlayer: null,
        searchRequest: createStatSearchRequest('pass-attempt', 't0', ['t0', 'p1']),
      },
    })

    const results = wrapper.findAll('.result-entry')
    expect(results).toHaveLength(2)
    expect(results[0].attributes('aria-label')).toContain('Forehand')
    expect(results[0].attributes('aria-label')).toContain('6 seconds')
    expect(results[0].text()).toContain('Player One')
    expect(results[1].attributes('aria-label')).toContain('11 seconds')
    expect(results[1].text()).toContain('Home')

    wrapper.unmount()
  })

  it('filters successful, failed, and long-pass searches for a selected team', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))

    usePassesStore().setPasses([{ id: 'pass', name: 'Forehand', isActive: true }])
    const longModifier = getPassModifierId('long')
    const journalStore = useJournalStore()
    const records: JournalEntry[] = [
      { id: 1, type: JournalEntryType.PLAYER, name: 'p1', ts: 1, source: JournalEntrySource.USER },
      {
        id: 2,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 2,
        source: JournalEntrySource.USER,
        modifiers: new Set([longModifier]),
      },
      { id: 3, type: JournalEntryType.PLAYER, name: 'p1', ts: 3, source: JournalEntrySource.USER },
      { id: 4, type: JournalEntryType.PLAYER, name: 'p1', ts: 4, source: JournalEntrySource.USER },
      {
        id: 5,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 5,
        source: JournalEntrySource.USER,
        modifiers: new Set([longModifier]),
      },
      { id: 6, type: JournalEntryType.PLAYER, name: 'p2', ts: 6, source: JournalEntrySource.USER },
      { id: 7, type: JournalEntryType.PLAYER, name: 't0', ts: 7, source: JournalEntrySource.USER },
      {
        id: 8,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 8,
        source: JournalEntrySource.USER,
        modifiers: new Set([longModifier]),
      },
      { id: 9, type: JournalEntryType.PLAYER, name: 't0', ts: 9, source: JournalEntrySource.USER },
      {
        id: 10,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 10,
        source: JournalEntrySource.USER,
      },
      {
        id: 11,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 11,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
      {
        id: 12,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 12,
        source: JournalEntrySource.USER,
      },
    ]
    records.forEach((record) => journalStore.addRecord(record))

    const wrapper = mount(PlayerSearch, {
      props: {
        videoPlayer: null,
        searchRequest: createStatSearchRequest(
          'pass-attempt',
          't0',
          ['t0', 'p1'],
          [{ field: 'outcome', operator: 'equals', value: 'completed' }],
        ),
      },
    })

    const results = wrapper.findAll('.result-entry')
    expect(results).toHaveLength(3)
    expect(results.map((result) => result.attributes('aria-label'))).toEqual([
      expect.stringContaining('2 seconds'),
      expect.stringContaining('8 seconds'),
      expect.stringContaining('11 seconds'),
    ])

    await wrapper.setProps({
      searchRequest: createStatSearchRequest(
        'pass-attempt',
        't0',
        ['t0', 'p1'],
        [{ field: 'outcome', operator: 'equals', value: 'failed' }],
      ),
    })
    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(1))
    expect(wrapper.find('.result-entry').attributes('aria-label')).toContain('5 seconds')

    await wrapper.setProps({
      searchRequest: createStatSearchRequest(
        'pass-attempt',
        't0',
        ['t0', 'p1'],
        [
          { field: 'isLong', operator: 'equals', value: true },
          { field: 'outcome', operator: 'equals', value: 'completed' },
        ],
      ),
    })
    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(2))
    expect(
      wrapper.findAll('.result-entry').map((result) => result.attributes('aria-label')),
    ).toEqual([expect.stringContaining('2 seconds'), expect.stringContaining('8 seconds')])

    await wrapper.setProps({
      searchRequest: createStatSearchRequest(
        'pass-attempt',
        't0',
        ['t0', 'p1'],
        [
          { field: 'isLong', operator: 'equals', value: true },
          { field: 'outcome', operator: 'equals', value: 'failed' },
        ],
      ),
    })
    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(1))
    expect(wrapper.find('.result-entry').attributes('aria-label')).toContain('5 seconds')

    wrapper.unmount()
  })

  it('finds the pass that led directly to a score', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))
    teamStore.teams[0].players.push(createPlayer('p4', 'Player Four'))

    usePassesStore().setPasses([{ id: 'pass', name: 'Forehand', isActive: true }])
    const journalStore = useJournalStore()
    const records: JournalEntry[] = [
      { id: 1, type: JournalEntryType.PLAYER, name: 'p1', ts: 1, source: JournalEntrySource.USER },
      {
        id: 2,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 2,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
      { id: 3, type: JournalEntryType.PLAYER, name: 'p4', ts: 3, source: JournalEntrySource.USER },
      {
        id: 4,
        type: JournalEntryType.PASS,
        name: 'pass',
        ts: 4,
        source: JournalEntrySource.USER,
        modifiers: new Set(),
      },
      { id: 5, type: JournalEntryType.PLAYER, name: 'p1', ts: 5, source: JournalEntrySource.USER },
      {
        id: 6,
        type: JournalEntryType.POSITIVE_ACTION,
        name: ACTION_IDS.SCORE,
        ts: 6,
        source: JournalEntrySource.USER,
      },
    ]
    records.forEach((record) => journalStore.addRecord(record))

    const wrapper = mount(PlayerSearch, {
      props: {
        videoPlayer: null,
        searchRequest: createStatSearchRequest(
          'score-assist',
          't0',
          ['t0', 'p1', 'p4'],
          [{ field: 'level', operator: 'equals', value: 0 }],
        ),
      },
    })

    const results = wrapper.findAll('.result-entry')
    expect(results).toHaveLength(1)
    expect(results[0].attributes('aria-label')).toContain('4 seconds')
    expect(results[0].text()).toContain('Player Four')
    expect(results[0].text()).toContain('Player One')

    wrapper.unmount()
  })

  it('limits occurrences to the points included in the selected stats scope', async () => {
    const teamStore = useTeamStore()
    await vi.waitFor(() => expect(teamStore.teams[0].players).toHaveLength(1))

    const journalStore = useJournalStore()
    const records: JournalEntry[] = [
      {
        id: 1,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 5,
        source: JournalEntrySource.USER,
      },
      {
        id: 2,
        type: JournalEntryType.POSITIVE_ACTION,
        name: ACTION_IDS.SCORE,
        ts: 10,
        source: JournalEntrySource.USER,
      },
      {
        id: 3,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 15,
        source: JournalEntrySource.USER,
      },
      {
        id: 4,
        type: JournalEntryType.POSITIVE_ACTION,
        name: ACTION_IDS.SCORE,
        ts: 20,
        source: JournalEntrySource.USER,
      },
      {
        id: 5,
        type: JournalEntryType.PLAYER,
        name: 'p1',
        ts: 25,
        source: JournalEntrySource.USER,
      },
    ]
    records.forEach((record) => journalStore.addRecord(record))

    const stateStore = useStateStore()
    stateStore.pointIndex = 1
    const wrapper = mount(PlayerSearch, {
      props: {
        videoPlayer: null,
        searchRequest: createStatSearchRequest('player-occurrence', 'p1', ['p1']),
      },
    })

    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(1))
    expect(wrapper.find('.result-entry').attributes('aria-label')).toContain('15 seconds')

    stateStore.statsScope = 1
    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(2))
    expect(wrapper.findAll('.result-entry').map((entry) => entry.attributes('aria-label'))).toEqual(
      [expect.stringContaining('5 seconds'), expect.stringContaining('15 seconds')],
    )

    stateStore.statsScope = 2
    await vi.waitFor(() => expect(wrapper.findAll('.result-entry')).toHaveLength(3))
    expect(wrapper.findAll('.result-entry').map((entry) => entry.attributes('aria-label'))).toEqual(
      [
        expect.stringContaining('5 seconds'),
        expect.stringContaining('15 seconds'),
        expect.stringContaining('25 seconds'),
      ],
    )

    wrapper.unmount()
  })
})
