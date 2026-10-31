import { JournalEntryType } from '@/types/journaltypes'

interface ScoreActionRecord {
  type: JournalEntryType
  name: string
}

interface ActionLookup {
  getActionByID(id: string): { name: string } | undefined
}

export function isActionRecordNamed(
  record: ScoreActionRecord,
  actions: ActionLookup,
  name: string,
): boolean {
  if (
    record.type !== JournalEntryType.POSITIVE_ACTION &&
    record.type !== JournalEntryType.NEGATIVE_ACTION
  ) {
    return false
  }

  const action = actions.getActionByID(record.name)
  return (action?.name ?? record.name).trim().toLowerCase() === name.trim().toLowerCase()
}

export function isScoreActionRecord(record: ScoreActionRecord, actions: ActionLookup): boolean {
  return isActionRecordNamed(record, actions, 'score')
}
