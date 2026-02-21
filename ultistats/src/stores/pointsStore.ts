import { computed } from 'vue'
import type { JournalEntry } from '@/stores/journal'
import { JournalEntryType as jet } from '@/types/journaltypes'
import { useTeamStore } from './Team'

export class Point {
  startTime: number
  pullTime: number
  endTime = computed(() =>
    this.records[this.records.length - 1]?.name == 'score'
      ? this.records[this.records.length - 1].ts
      : Number.MAX_SAFE_INTEGER,
  )
  records: JournalEntry[] = []
  isFinished = computed(() => Boolean(this.records[this.records.length - 1].name == 'score'))
  attackingTeam: number = -1
  scoringTeam: number = -1
  hasPull = false
  constructor(startTime: number) {
    this.startTime = startTime
    this.pullTime = startTime
  }
  addRecord(record: JournalEntry) {
    this.records.push(record)
  }
}

export const separateRecordsInPoints = (records: JournalEntry[]) => {
  const tmp_points: Point[] = []
  const firstPoint = new Point(0)
  tmp_points.push(firstPoint)

  records.forEach((record, i) => {
    tmp_points[tmp_points.length - 1].addRecord(record)
    if (record.name === 'pull') {
      tmp_points[tmp_points.length - 1].pullTime = record.ts
      tmp_points[tmp_points.length - 1].hasPull = true
      for (let j = i; j < records.length; j++) {
        if (records[j].type == jet.PLAYER) {
          const teamStore = useTeamStore()
          tmp_points[tmp_points.length - 1].attackingTeam = teamStore.getPlayerTeam(
            teamStore.getPlayerByID(records[j].name)!,
          )
          break
        }
      }
    } else if (record.name === 'score') {
      for (let j = i - 1; j > 0; j--) {
        if (records[j].type == jet.PLAYER) {
          const teamStore = useTeamStore()
          tmp_points[tmp_points.length - 1].scoringTeam = teamStore.getPlayerTeam(
            teamStore.getPlayerByID(records[j].name)!,
          )
          break
        }
      }
      tmp_points.push(new Point(record.ts + 1))
    }
  })
  return tmp_points
}
