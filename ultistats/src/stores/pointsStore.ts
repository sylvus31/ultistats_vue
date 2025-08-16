import { computed } from 'vue'
import type { JournalEntry } from '@/stores/journal'

class Point {
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

export const points = (records: JournalEntry[]) => {
  const tmp_points: Point[] = []
  const firstPoint = new Point(records[0].ts)
  tmp_points.push(firstPoint)

  records.forEach((record) => {
    tmp_points[tmp_points.length - 1].addRecord(record)
    if (record.name == 'score') {
      tmp_points.push(new Point(record.ts + 1))
    }
  })
  return tmp_points
}
