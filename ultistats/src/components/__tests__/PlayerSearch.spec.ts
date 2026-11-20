import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayerSearch from '../PlayerSearch.vue'
import { useActionsStore } from '@/stores/ActionsStore'
import { useEventsStore } from '@/stores/EventsStore'
import { useJournalStore, type JournalEntry } from '@/stores/journal'
import { usePassesStore } from '@/stores/passesStore'
import { useTeamStore } from '@/stores/Team'
import { ActionType } from '@/types/ActionsType'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'

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
    useActionsStore().setActions(
      [{ id: 'goal', name: 'Goal', type: ActionType.POSITIVE }],
      [],
    )
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
    expect(playerButtons[0].get('.player-name').element.style.textDecorationColor).toBe('#00bcd4')

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
})
