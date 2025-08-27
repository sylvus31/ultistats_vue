<template>
  <RevoGrid
    class="select-full-height"
    id="revo-grid"
    hide-attribution
    :columns="columns"
    :source="rows"
    :theme="'darkCompact'"
  />
</template>

<style scoped>
.select-full-height {
  height: 90vh;
}
</style>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import RevoGrid, { VGridVueTemplate } from '@revolist/vue3-datagrid'
import { useTeamStore } from '@/stores/Team'
import { useJournalStore, type JournalEntry } from '@/stores/journal'
import { useStateStore } from '@/stores/StateStore'
import type { Point } from '@/stores/pointsStore'
import { JournalEntryType as jet, type journalPass } from '@/types/journaltypes'
import PlayedTimeCell from './stats/PlayedTimeCell.vue'
import TargetsCell from './stats/TargetsCell.vue'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'

const videoPlayerRef = ref<VideoPlayerInstance | null>(null)
const setVideoPlayerRef = (ref: Ref<VideoPlayerInstance | null>) => {
  videoPlayerRef.value = ref.value
}
const teamStore = useTeamStore()
const journalStore = useJournalStore()
const stateStore = useStateStore()
const columns = ref([
  { prop: 'player', name: 'Player' },
  { prop: 'passes_total', name: 'P total' },
  { prop: 'passes_success', name: 'P réussies' },
  { prop: 'passes_fail', name: 'P ratées' },
  { prop: 'passes_D', name: 'P décisives' },
  { prop: 'points', name: 'Points' },
  { prop: 'defenses', name: 'Défenses' },
  { prop: 'played_points', name: 'Nb joués' },
  { prop: 'played_time', name: 'Temps', cellTemplate: VGridVueTemplate(PlayedTimeCell) },
  { prop: 'targets', name: 'Cibles', cellTemplate: VGridVueTemplate(TargetsCell) },
  { prop: 'providers', name: 'Lanceurs', cellTemplate: VGridVueTemplate(TargetsCell) },
  { prop: 'passesType', name: 'Type de passes', cellTemplate: VGridVueTemplate(TargetsCell) },
  { prop: 'pulls', name: 'Pulls' },
  { prop: 'pickUps', name: 'PickUps' },
])

class StringNumberMap extends Map<string, number> {
  constructor(iterable: Iterable<[string, number]> = []) {
    super(iterable)
  }

  getOrDefault(key: string, bckpValue = 0): number {
    return super.get(key) ?? bckpValue
  }

  increment(key: string) {
    this.set(key, this.getOrDefault(key) + 1)
  }
}
interface Row {
  player: string
  passes_total: number
  passes_success: number
  passes_fail: number
  passes_D: number
  points: number
  defenses: number
  played_points: number
  played_time: number
  targets: StringNumberMap
  providers: StringNumberMap
  passesType: StringNumberMap
  longue_success: number
  long_fail: number
  pulls: number
  pickUps: number
  offensives_points: [number, number]
  defensives_points: [number, number]
}

const rows = ref<Row[]>([])
const initStats = (r: Row[]) => {
  r.splice(0, r.length)
  r.push(initRow('ADVERSAIRE'))
  r.push(initRow('BTR'))

  teamStore.players.forEach((p) => {
    if (p.name === 'ADVERSAIRE') return
    r.push(initRow(p.name))
  })
}
const initRow = (name: string) => {
  return {
    player: name,
    passes_total: 0,
    passes_success: 0,
    passes_fail: 0,
    passes_D: 0,
    points: 0,
    defenses: 0,
    played_points: 0,
    played_time: 0,
    targets: new StringNumberMap(),
    providers: new StringNumberMap(),
    passesType: new StringNumberMap(),
    longue_success: 0,
    long_fail: 0,
    pulls: 0,
    pickUps: 0,
    offensives_points: [0, 0] as [number, number],
    defensives_points: [0, 0] as [number, number],
  }
}

initStats(rows.value)
const initMap = () => {
  const emptyMap = new Map<string, Row>()
  const players = teamStore.players.map((p) => p.name)
  players.push('BTR')
  players.forEach((p) => {
    emptyMap.set(p, initRow(p))
  })

  return emptyMap
}

const getStatsForOnePoint = (records: JournalEntry[], baseValues: Map<string, Row>) => {
  records.forEach((r, i) => {
    if (r.type === jet.PLAYER) {
      const thrower = r.name
      for (let j = i + 1; j < records.length; j++) {
        if (records[j].type === jet.PLAYER) {
          const receiver = records[j].name
          let passType = 'pass'
          let passModifiers = new Set<string>()
          //get type of pass
          for (let k = i + 1; k < j; k++) {
            if (records[k].type === jet.PASS) {
              const pass = records[k] as journalPass
              passType = pass.name
              passModifiers = pass.modifiers
              break
            }
          }
          baseValues.get(thrower)!.passes_total += 1
          baseValues.get(thrower)!.passesType.increment(passType)
          const isLong = passModifiers.has('long')
          const success =
            (thrower === 'ADVERSAIRE' && receiver === 'ADVERSAIRE') ||
            (thrower !== 'ADVERSAIRE' && receiver !== 'ADVERSAIRE')

          if (success) {
            baseValues.get(thrower)!.passes_success += 1
            if (isLong) {
              baseValues.get(thrower)!.longue_success += 1
            }
          } else {
            baseValues.get(thrower)!.passes_fail += 1
            if (isLong) {
              baseValues.get(thrower)!.long_fail += 1
            }
          }
          //count receivers
          baseValues.get(thrower)!.targets.increment(receiver)
          //count providers
          baseValues.get(receiver)!.providers.increment(thrower)
          break
        } else if (records[j].name === 'pull') {
          baseValues.get(thrower)!.pulls += 1
          break
        } else if (records[j].name === 'pick up disc') {
          baseValues.get(thrower)!.pickUps += 1
          // no break needed, same player has disc
        }
      }
    } else if (r.name === 'score') {
      // get scorer
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          baseValues.get(records[j].name)!.points += 1
          // get passe D
          for (let k = j - 1; k >= 0; k--) {
            if (records[k].type === jet.PLAYER) {
              // calahan is cunted as a pass D
              baseValues.get(records[k].name)!.passes_D += 1
              break
            }
          }
          break
        }
      }
      // get line
      for (let j = i - 1; j >= 0; j--) {
        const line = records[j]
        if (line.type === jet.LINE && 'players' in line) {
          let pullTime = line.ts // if no pull recorded
          for (let k = j + 1; k < records.length; k++) {
            if (records[k].name === 'pull') {
              pullTime = records[k].ts
              break
            }
          }
          const time = records[i].ts - pullTime
          line.players.forEach((p) => {
            baseValues.get(p)!.played_points += 1
            baseValues.get(p)!.played_time += time
          })
          break
        }
      }
    } else if (['block', 'intercept'].includes(r.name)) {
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          baseValues.get(records[j].name)!.defenses += 1
          break
        }
      }
    }
  })

  //add BTR line
  const btrStats = initRow('BTR')
  baseValues.forEach((r) => {
    if (r.player !== 'ADVERSAIRE' && r.player !== 'BTR') {
      btrStats.passes_total += r.passes_total
      btrStats.passes_success += r.passes_success
      btrStats.passes_fail += r.passes_fail
      btrStats.passes_D += r.passes_D
      btrStats.points += r.points
      btrStats.defenses += r.defenses
      btrStats.pulls += r.pulls
      btrStats.pickUps += r.pickUps

      r.targets.forEach((v, k) => {
        btrStats.targets.set(k, btrStats.targets.getOrDefault(k) + v)
      })
      r.providers.forEach((v, k) => {
        btrStats.providers.set(k, btrStats.providers.getOrDefault(k) + v)
      })
      r.passesType.forEach((v, k) => {
        btrStats.passesType.set(k, btrStats.passesType.getOrDefault(k) + v)
      })
    }
  })
  btrStats.played_time = baseValues.get('ADVERSAIRE')!.played_time
  btrStats.played_points = baseValues.get('ADVERSAIRE')!.played_points
  baseValues.set('BTR', btrStats)

  console.log('baseValues', baseValues)
  return baseValues
}

const getPointsForStats = (points: Point[]) => {
  const p = new Array<Point>()
  if (stateStore.statsScope === 0) {
    p.push(points[stateStore.pointIndex])
  } else if (stateStore.statsScope === 1) {
    for (let i = 0; i <= stateStore.pointIndex; i++) {
      p.push(points[i])
    }
  } else if (stateStore.statsScope === 2) {
    for (let i = 0; i < points.length; i++) {
      p.push(points[i])
    }
  }
  return p
}

stateStore.$subscribe((mutation, state) => {
  console.log(' watch stateStore', state.statsScope, state.pointIndex)
  updateStatGrid()
})
//TODO update real time, not wait for score

const updateStatGrid = () => {
  let statsMap = initMap()
  if (journalStore.recordsAsPoints.length === 0) return
  const pointsForStats = getPointsForStats(journalStore.recordsAsPoints)
  pointsForStats.forEach((p) => {
    statsMap = getStatsForOnePoint(p.records, statsMap)
  })

  // update the grid
  rows.value = rows.value.map((r) => statsMap.get(r.player)!)
  const grid = document.querySelector('revo-grid')
  if (grid) {
    grid.refresh()
  }
}

watch(journalStore.sortedRecords, () => {
  console.log('watch journalStore.sortedRecords')
  updateStatGrid()
})

defineExpose({
  setVideoPlayerRef,
})
</script>
