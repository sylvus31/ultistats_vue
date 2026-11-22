<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { watch, computed, inject, ref, type Ref } from 'vue'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
import { useStateStore } from '@/stores/StateStore'
import { Point } from '@/stores/pointsStore'
import { useActionsStore } from '@/stores/ActionsStore'
import { useTeamStore } from '@/stores/Team'

const videoPlayerRef = inject<Ref<VideoPlayerInstance | null>>('videoPlayerRef')

const stateStore = useStateStore()

const journalStore = useJournalStore()
const actionsStore = useActionsStore()
const teamStore = useTeamStore()

const totalScore = ref<[number, number]>([0, 0])
type ScorePoint = Pick<Point, 'pullTime' | 'scoringTeam' | 'attackingTeam'>
const updateTotalScore = (points: Point[] = journalStore.recordsAsPoints) => {
  totalScore.value = [0, 0]
  points.forEach((p) => {
    if (p.scoringTeam === 0 || p.scoringTeam === 1) {
      totalScore.value[p.scoringTeam] += 1
    }
  })
  console.log('totalScore', totalScore.value)
}
const scoreEvolution = ref<Array<{ point: ScorePoint; index: number }>>([])
watch(
  () => [journalStore.sortedRecords, actionsStore.positiveActions, actionsStore.negativeActions],
  () => {
    console.log('journalStore.recordsAsPoints', journalStore.recordsAsPoints)
    scoreEvolution.value = journalStore.recordsAsPoints.flatMap((point, index) =>
      point.hasPull ? [{ point, index }] : [],
    )
    updateTotalScore()
  },
  { deep: true, immediate: true },
)
watch(
  [() => videoPlayerRef?.value?.elapsedTimeValue, () => journalStore.recordsAsPoints],
  ([videoTime]) => {
    if (videoTime === undefined) return
    const currentPoint =
      [...scoreEvolution.value].reverse().find(({ point }) => point.pullTime - 2 <= videoTime) ??
      scoreEvolution.value[0]
    if (currentPoint) stateStore.pointIndex = currentPoint.index
  },
  { immediate: true },
)
const setVideoToBeginningOfPoint = (point: ScorePoint, index: number) => {
  if (videoPlayerRef?.value) {
    console.log('setVideoToBeginningOfPoint', point)

    videoPlayerRef.value.goTo(point.pullTime - 2)
  }
  stateStore.pointIndex = index
}

const score = computed(() => {
  return totalScore.value
})

defineExpose({})
</script>
<template>
  <div>
    {{ teamStore.teams[0].name }}: {{ score[0] }} - {{ score[1] }} {{ teamStore.teams[1].name }}
  </div>
  <div>&nbsp;&nbsp;&nbsp;</div>
  <div v-for="item in scoreEvolution" :key="item.index">
    <div
      class="score-circle"
      :style="{
        'background-color':
          item.point.scoringTeam === 0
            ? '#035812ac'
            : item.point.scoringTeam === 1
              ? '#8b0a1a'
              : 'white',
      }"
      @click="setVideoToBeginningOfPoint(item.point, item.index)"
    >
      <!-- <div class="red-possession-circle"></div> -->
      <div
        class="start-circle"
        :style="{
          'background-color': item.point.attackingTeam === 0 ? '#035812ac' : '#8b0a1a',
        }"
      ></div>
      <div v-if="stateStore.pointIndex === item.index" class="current-point-indicator"></div>
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
.current-point-indicator {
  width: 4px;
  height: 4px;
  position: absolute;
  top: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid #222;
  border-radius: 50%;
  background-color: white;
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
