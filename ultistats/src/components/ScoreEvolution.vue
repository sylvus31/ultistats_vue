<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { watch, computed, inject, ref, type Ref } from 'vue'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
import { useStateStore } from '@/stores/StateStore'
import { Point } from '@/stores/pointsStore'

const videoPlayerRef = inject<Ref<VideoPlayerInstance | null>>('videoPlayerRef')

const stateStore = useStateStore()

const journalStore = useJournalStore()

const totalScore: [number, number] = [0, 0]
const updateTotalScore = (points: Point[] = journalStore.recordsAsPoints) => {
  totalScore[0] = 0
  totalScore[1] = 0
  points.forEach((p) => {
    if (p.scoringTeam === 0 || p.scoringTeam === 1) {
      totalScore[p.scoringTeam] += 1
    }
  })
  console.log('totalScore', totalScore)
}
const scoreEvolution = ref<Point[]>([])
watch(journalStore.sortedRecords, () => {
  console.log('journalStore.recordsAsPoints', journalStore.recordsAsPoints)
  scoreEvolution.value = []
  scoreEvolution.value = journalStore.recordsAsPoints.filter((p) => p.hasPull)
  updateTotalScore()
})
const setVideoToBeginningOfPoint = (point: { pullTime: number }, index: number) => {
  if (videoPlayerRef?.value) {
    console.log('setVideoToBeginningOfPoint', point)

    videoPlayerRef.value.goTo(point.pullTime - 2)
  }
  stateStore.pointIndex = index
}

const score = computed(() => {
  return totalScore
})

defineExpose({})
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
