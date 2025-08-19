import { computed } from 'vue'
import type { JournalEntry } from '@/stores/journal'
import { JournalEntryType as jet } from '@/types/journaltypes'

export class Point {
  startTime: number
  endTime = computed(() =>
    Number(this.records[this.records.length - 1].name == 'score')
      ? this.records[this.records.length - 1].ts
      : Number.MAX_SAFE_INTEGER,
  )
  records: JournalEntry[] = []
  isFinished = computed(() => Boolean(this.records[this.records.length - 1].name == 'score'))
  attackingTeam: number = -1
  scoringTeam: number = -1

  constructor(startTime: number) {
    this.startTime = startTime
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
      for (let j = i; j < records.length; j++) {
        if (records[j].type == jet.PLAYER) {
          if (records[j].name == 'ADVERSAIRE') {
            tmp_points[tmp_points.length - 1].attackingTeam = 0
          } else {
            tmp_points[tmp_points.length - 1].attackingTeam = 1
          }
          break
        }
      }
    } else if (record.name === 'score') {
      for (let j = i - 1; j > 0; j--) {
        if (records[j].type == jet.PLAYER) {
          if (records[j].name == 'ADVERSAIRE') {
            tmp_points[tmp_points.length - 1].scoringTeam = 1
          } else {
            tmp_points[tmp_points.length - 1].scoringTeam = 0
          }
          break
        }
      }
      tmp_points.push(new Point(record.ts + 1))
    }
  })
  return tmp_points
}
