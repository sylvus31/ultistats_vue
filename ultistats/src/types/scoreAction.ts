import { JournalEntryType } from '@/types/journaltypes'
import { ACTION_IDS } from '@/types/catalogIds'

interface ScoreActionRecord {
  type: JournalEntryType
  name: string
}

export function isActionRecord(record: ScoreActionRecord, actionId: string): boolean {
  if (
    record.type !== JournalEntryType.POSITIVE_ACTION &&
    record.type !== JournalEntryType.NEGATIVE_ACTION
  ) {
    return false
  }

  return record.name === actionId
}

export function isScoreActionRecord(record: ScoreActionRecord): boolean {
  return isActionRecord(record, ACTION_IDS.SCORE)
}
