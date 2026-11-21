import type { JournalEntry } from '@/stores/journal'
import type { journalAction, journalPass, journalPlayer } from '@/types/journaltypes'
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
      recordIndex: number
      outcome: 'completed' | 'failed' | 'unresolved'
      isLong: boolean
      receiver: journalPlayer | null
    }
  | {
      kind: 'score-assist'
      playerId: string
      record: journalPass
      scoreRecord: journalAction
      level: 0 | 1 | 2
    }
  | {
      kind: 'defense'
      playerId: string
      record: journalAction
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
  | {
      field: 'outcome'
      operator: 'equals'
      value: Extract<StatEvent, { kind: 'pass-attempt' }>['outcome']
    }
  | {
      field: 'isLong'
      operator: 'equals'
      value: boolean
    }
  | {
      field: 'level'
      operator: 'equals'
      value: 0 | 1 | 2
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

function isScoreEntry(record: JournalEntry): record is journalAction {
  return (
    (record.type === jet.POSITIVE_ACTION || record.type === jet.NEGATIVE_ACTION) &&
    record.name === ACTION_IDS.SCORE
  )
}

function isDefenseEntry(record: JournalEntry): record is journalAction {
  return (
    (record.type === jet.POSITIVE_ACTION || record.type === jet.NEGATIVE_ACTION) &&
    (record.name === ACTION_IDS.BLOCK ||
      record.name === ACTION_IDS.INTERCEPT ||
      record.name === ACTION_IDS.DEFENSE)
  )
}

export function createStatSearchRequest(
  kind: StatEvent['kind'],
  subjectId: string,
  playerIds: readonly string[],
  additionalCriteria: readonly StatEventCriterion[] = [],
): StatSearchRequest {
  return {
    subjectId,
    criteria: [
      { field: 'kind', operator: 'equals', value: kind },
      { field: 'playerId', operator: 'in', value: playerIds },
      ...additionalCriteria,
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
  const passAttempts: Extract<StatEvent, { kind: 'pass-attempt' }>[] = []
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
      const event: Extract<StatEvent, { kind: 'pass-attempt' }> = {
        kind: 'pass-attempt',
        playerId: latestPlayer.name,
        record,
        recordIndex: index,
        outcome,
        isLong: hasPassModifier(record.modifiers, 'long'),
        receiver,
      }
      events.push(event)
      passAttempts.push(event)
    } else if (isDefenseEntry(record) && latestPlayer) {
      events.push({
        kind: 'defense',
        playerId: latestPlayer.name,
        record,
      })
    }
  })

  records.forEach((record, scoreIndex) => {
    if (!isScoreEntry(record)) return

    let scorer: journalPlayer | undefined
    for (let i = scoreIndex - 1; i >= 0; i--) {
      const previousRecord = records[i]
      if (previousRecord && isPlayerEntry(previousRecord)) {
        scorer = previousRecord
        break
      }
    }
    if (!scorer) return

    let receiverRecordId = scorer.id
    let beforeIndex = scoreIndex
    for (const level of [0, 1, 2] as const) {
      const pass = [...passAttempts]
        .reverse()
        .find(
          (attempt) =>
            attempt.recordIndex < beforeIndex &&
            attempt.outcome === 'completed' &&
            attempt.receiver?.id === receiverRecordId,
        )
      if (!pass || !pass.receiver) break

      events.push({
        kind: 'score-assist',
        playerId: pass.playerId,
        record: pass.record,
        scoreRecord: record,
        level,
      })

      let throwerRecord: journalPlayer | undefined
      for (let i = pass.recordIndex - 1; i >= 0; i--) {
        const previousRecord = records[i]
        if (
          previousRecord &&
          isPlayerEntry(previousRecord) &&
          previousRecord.name === pass.playerId
        ) {
          throwerRecord = previousRecord
          break
        }
      }
      if (!throwerRecord) break
      receiverRecordId = throwerRecord.id
      beforeIndex = pass.recordIndex
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
        case 'outcome':
          return (
            event.kind === 'pass-attempt' &&
            criterion.operator === 'equals' &&
            event.outcome === criterion.value
          )
        case 'isLong':
          return (
            event.kind === 'pass-attempt' &&
            criterion.operator === 'equals' &&
            event.isLong === criterion.value
          )
        case 'level':
          return (
            event.kind === 'score-assist' &&
            criterion.operator === 'equals' &&
            event.level === criterion.value
          )
      }
    }),
  )
}
