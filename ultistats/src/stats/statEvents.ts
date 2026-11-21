import type { JournalEntry } from '@/stores/journal'
import type { journalPass, journalPlayer } from '@/types/journaltypes'
import { JournalEntryType as jet } from '@/types/journaltypes'
import { hasPassModifier } from '@/types/passModifiers'
import { ACTION_IDS } from '@/types/catalogIds'
import { isActionRecord, isScoreActionRecord } from '@/types/scoreAction'

export type StatEvent =
  | {
      kind: 'player-occurrence'
      playerId: string
      record: journalPlayer
    }
  | {
      kind: 'pass-attempt'
      playerId: string
      record: journalPass
      outcome: 'completed' | 'failed' | 'unresolved'
      isLong: boolean
      receiver: journalPlayer | null
    }

export type StatEventCriterion =
  | {
      field: 'kind'
      operator: 'equals'
      value: StatEvent['kind']
    }
  | {
      field: 'playerId'
      operator: 'in'
      value: readonly string[]
    }

export interface StatSearchRequest {
  subjectId: string
  criteria: StatEventCriterion[]
}

function isPlayerEntry(record: JournalEntry): record is journalPlayer {
  return record.type === jet.PLAYER
}

function isPassEntry(record: JournalEntry): record is journalPass {
  return record.type === jet.PASS
}

export function createStatSearchRequest(
  kind: StatEvent['kind'],
  subjectId: string,
  playerIds: readonly string[],
): StatSearchRequest {
  return {
    subjectId,
    criteria: [
      { field: 'kind', operator: 'equals', value: kind },
      { field: 'playerId', operator: 'in', value: playerIds },
    ],
  }
}

function getPassOutcome(
  records: JournalEntry[],
  passIndex: number,
  throwerId: string,
  getTeamIndex: (playerId: string) => number,
): {
  outcome: 'completed' | 'failed' | 'unresolved'
  receiver: journalPlayer | null
} {
  for (let i = passIndex + 1; i < records.length; i++) {
    const nextRecord = records[i]
    if (nextRecord && isPlayerEntry(nextRecord)) {
      const throwerTeam = getTeamIndex(throwerId)
      const receiverTeam = getTeamIndex(nextRecord.name)
      if (throwerTeam < 0 || receiverTeam < 0) {
        return { outcome: 'unresolved', receiver: nextRecord }
      }
      return {
        outcome: throwerTeam === receiverTeam ? 'completed' : 'failed',
        receiver: nextRecord,
      }
    }

    if (nextRecord && isActionRecord(nextRecord, ACTION_IDS.DROP)) {
      return { outcome: 'failed', receiver: null }
    }
    if (
      (nextRecord && isPassEntry(nextRecord)) ||
      (nextRecord && isScoreActionRecord(nextRecord)) ||
      (nextRecord && isActionRecord(nextRecord, ACTION_IDS.PULL)) ||
      (nextRecord && isActionRecord(nextRecord, ACTION_IDS.BLOCK))
    ) {
      return { outcome: 'unresolved', receiver: null }
    }
  }

  return { outcome: 'unresolved', receiver: null }
}

export function buildStatEvents(
  records: JournalEntry[],
  getTeamIndex: (playerId: string) => number,
): StatEvent[] {
  const events: StatEvent[] = []
  let latestPlayer: journalPlayer | undefined

  records.forEach((record, index) => {
    if (isPlayerEntry(record)) {
      latestPlayer = record
      events.push({
        kind: 'player-occurrence',
        playerId: record.name,
        record,
      })
    } else if (isPassEntry(record) && latestPlayer) {
      const { outcome, receiver } = getPassOutcome(records, index, latestPlayer.name, getTeamIndex)
      events.push({
        kind: 'pass-attempt',
        playerId: latestPlayer.name,
        record,
        outcome,
        isLong: hasPassModifier(record.modifiers, 'long'),
        receiver,
      })
    }
  })

  return events
}

export function searchStatEvents(
  events: StatEvent[],
  criteria: readonly StatEventCriterion[],
): StatEvent[] {
  return events.filter((event) =>
    criteria.every((criterion) => {
      switch (criterion.field) {
        case 'kind':
          return criterion.operator === 'equals' && event.kind === criterion.value
        case 'playerId':
          return criterion.operator === 'in' && criterion.value.includes(event.playerId)
      }
    }),
  )
}
