<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { computed, inject, ref, type Ref } from 'vue'
import { JournalEntryType as jet } from '@/types/journaltypes'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
import { useStateStore } from '@/stores/StateStore'

const videoPlayerRef = inject<Ref<VideoPlayerInstance | null>>('videoPlayerRef')

const stateStore = useStateStore()

const journalStore = useJournalStore()
interface point {
  pullTime: number
  endTime: number
  currentScore: [number, number]
  scoringTeam: number
  attackingTeam: number
}

const totalScore: [number, number] = [0, 0]
const init = () => {
  totalScore[0] = 0
  totalScore[1] = 0
}
const scoreEvolution = ref<point[]>([])
journalStore.$subscribe((mutation, state) => {
  const records = journalStore.records.sort((a, b) => (a.ts === b.ts ? a.id - b.id : a.ts - b.ts))
  init()
  const points: point[] = []

  records.forEach((r, i) => {
    if (r.name === 'pull') {
      //find pulling team
      let attackingTeam = 1
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          if (records[j].name === 'ADVERSAIRE') {
            attackingTeam = 0
          }
          break
        }
      }
      const newPoint = {
        pullTime: r.ts,
        endTime: Number.MAX_SAFE_INTEGER,
        currentScore: [totalScore[0], totalScore[1]] as [number, number],
        scoringTeam: -1,
        attackingTeam: attackingTeam,
      }
      points.push(newPoint)
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
      totalScore[scoringTeam] += 1
      points[points.length - 1].endTime = r.ts
      points[points.length - 1].scoringTeam = scoringTeam
    }
  })
  scoreEvolution.value = points.slice(0, points.length)
})
const setVideoToBeginningOfPoint = (point: point, index: number) => {
  if (videoPlayerRef?.value) {
    console.log('setVideoToBeginningOfPoint', point)

    videoPlayerRef.value.goTo(point.pullTime - 2)
  }
  stateStore.pointIndex = index
}
function getPointTimeFrame(ts: number) {
  const start = Math.max(
    ...scoreEvolution.value.filter((p) => p.endTime < ts).map((p) => p.endTime),
  )
  const end = Math.min(...scoreEvolution.value.filter((p) => p.endTime > ts).map((p) => p.endTime))
  console.log('getPointTimeFrame', start, end)
  return [start, end]
}

const score = computed(() => {
  if (!videoPlayerRef?.value) return [0, 0]
  const ts = videoPlayerRef.value.elapsedTimeValue

  if (scoreEvolution.value.length === 0) return [0, 0]
  if (scoreEvolution.value[scoreEvolution.value.length - 1].endTime < ts) return totalScore
  const currentPoint = scoreEvolution.value.filter((p) => p.endTime > ts)[0]
  return currentPoint ? currentPoint.currentScore : [0, 0]
})

defineExpose({
  getPointTimeFrame,
})
</script>
<template>
  <div>BTR: {{ score[0] }} - {{ score[1] }} ADV</div>
  <div>&nbsp;&nbsp;&nbsp;</div>
  <div v-for="(score, index) in scoreEvolution" :key="index">
    <div
      class="score-circle"
      :style="{
        'background-color':
          score.scoringTeam === 0 ? '#035812ac' : score.scoringTeam === 1 ? '#8b0a1a' : 'white',
      }"
      @click="setVideoToBeginningOfPoint(score, index)"
    >
      <!-- <div class="red-possession-circle"></div> -->
      <div
        class="start-circle"
        :style="{
          'background-color': score.attackingTeam === 0 ? '#035812ac' : '#8b0a1a',
        }"
      ></div>
    </div>
  </div>
</template>
<style scoped>
.score-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  margin-right: 5px;
  cursor: pointer;
}

.start-circle {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
.red-possession-circle {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 2px solid;
  border-color: red;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
</style>
