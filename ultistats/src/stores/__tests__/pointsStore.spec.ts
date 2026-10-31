import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { JournalEntrySource, JournalEntryType } from '@/types/journaltypes'
import { useActionsStore } from '../ActionsStore'
import { useTeamStore } from '../Team'
import { separateRecordsInPoints } from '../pointsStore'

describe('score actions in point grouping', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const data =
          url === '/teams.json'
            ? [
                { id: 't0', name: 'Home', players: [{ id: 'p1', name: 'Player One' }] },
                { id: 't1', name: 'Away', players: [] },
              ]
            : url === '/actions/positive_actions.json'
              ? [{ name: 'Score', terminal: true }]
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

  it('ends a point and determines the scoring team for score action IDs', async () => {
    const teamStore = useTeamStore()
    const actionsStore = useActionsStore()
    await vi.waitFor(() => {
      expect(teamStore.teams[0].players).toHaveLength(1)
      expect(actionsStore.positiveActions).toHaveLength(1)
    })

    const points = separateRecordsInPoints([
      {
        id: 1,
        name: 'pull',
        ts: 1,
        type: JournalEntryType.EVENT,
        source: JournalEntrySource.USER,
      },
      {
        id: 2,
        name: 'p1',
        ts: 2,
        type: JournalEntryType.PLAYER,
        source: JournalEntrySource.USER,
      },
      {
        id: 3,
        name: 'pa1',
        ts: 3,
        terminal: true,
        type: JournalEntryType.POSITIVE_ACTION,
        source: JournalEntrySource.USER,
      },
    ])

    expect(points).toHaveLength(2)
    expect(points[0].scoringTeam).toBe(0)
    expect(points[0].endTime.value).toBe(3)
    expect(points[0].isFinished.value).toBe(true)
  })
})
