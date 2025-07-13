<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { ref, type Ref } from 'vue'
import { JournalEntryType as jet } from '@/types/journaltypes'
import type Player from 'video.js/dist/types/player'

const videoPlayerRef = ref<Player | null>(null)
const setVideoPlayerRef = (ref: Ref<Player | null>) => {
  console.log('setVideoPlayerRef', ref)
  videoPlayerRef.value = ref.value
}

const journalStore = useJournalStore()
interface point {
  pullTime: number
  endTime: number
  currentScore: [number, number]
  scoringTeam: number
}

const currentScore: [number, number] = [0, 0]
const init = () => {
  currentScore[0] = 0
  currentScore[1] = 0
  scoreEvolution.value = []
}
const scoreEvolution = ref<point[]>([])
journalStore.$subscribe((mutation, state) => {
  const records = journalStore.records.sort((a, b) => (a.ts === b.ts ? a.id - b.id : a.ts - b.ts))
  console.log('records', records[records.length - 1].name)
  init()

  records.forEach((r, i) => {
    if (r.name === 'pull') {
      const newPoint = {
        pullTime: r.ts,
        endTime: Number.MAX_SAFE_INTEGER,
        currentScore: [currentScore[0], currentScore[1]] as [number, number],
        scoringTeam: -1,
      }
      scoreEvolution.value.push(newPoint)
    }
    if (r.name === 'score') {
      let scoringTeam = 0
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          if (records[j].name === 'ADVERSAIRE') {
            scoringTeam = 1
          }
          break
        }
      }
      currentScore[scoringTeam] += 1
      scoreEvolution.value[scoreEvolution.value.length - 1].endTime = r.ts
      scoreEvolution.value[scoreEvolution.value.length - 1].scoringTeam = scoringTeam
      scoreEvolution.value[scoreEvolution.value.length - 1].currentScore = [
        currentScore[0],
        currentScore[1],
      ]
    }
  })
  console.log('scoreEvolution', scoreEvolution.value)
})
const setVideoToBeginningOfPoint = (point: point) => {
  if (videoPlayerRef.value) {
    console.log('setVideoToBeginningOfPoint', point)

    videoPlayerRef.value.currentTime(point.pullTime - 2)
  }
}
function getPointTimeFrame(ts: number) {
  const start = Math.max(
    ...scoreEvolution.value.filter((p) => p.endTime < ts).map((p) => p.endTime),
  )
  const end = Math.min(...scoreEvolution.value.filter((p) => p.endTime > ts).map((p) => p.endTime))
  console.log('getPointTimeFrame', start, end)
  return [start, end]
}
defineExpose({
  setVideoPlayerRef,
  getPointTimeFrame,
})
</script>
<template>
  <div v-for="(score, index) in scoreEvolution" :key="index">
    <div
      class="scoring-circle"
      :style="{
        'background-color':
          score.scoringTeam === 0 ? '#035812ac' : score.scoringTeam === 1 ? '#8b0a1a' : 'white',
      }"
      @click="setVideoToBeginningOfPoint(score)"
    ></div>
  </div>
</template>
<style scoped>
.scoring-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  cursor: pointer;
}
</style>
