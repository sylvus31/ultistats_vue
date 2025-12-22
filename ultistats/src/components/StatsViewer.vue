<template>
  <DataTable
    :value="rows"
    :reorderableColumns="true"
    scrollable
    class="stat_viewer"
    tableStyle="min-width: 100rem"
  >
    <Column
      field="player"
      header="Player"
      :sortable="true"
      :frozen="true"
      style="background-color: #1a1a1a; font-weight: bold"
    ></Column>
    <Column field="passes_total" header="P total" :sortable="true"></Column>
    <Column field="passes_success" header="P success" :sortable="true"></Column>
    <Column field="passes_fail" header="P fail" :sortable="true"></Column>
    <Column field="long_success" header="L success" :sortable="true"></Column>
    <Column field="long_fail" header="L fail" :sortable="true"></Column>
    <Column field="passes_D" header="P D" :sortable="true">
      <template #body="slotProps">
        {{ slotProps.data.passes_D[0] }}
      </template>
    </Column>
    <Column field="passes_D" header="P D -1" :sortable="true">
      <template #body="slotProps">
        {{ slotProps.data.passes_D[1] }}
      </template>
    </Column>
    <Column field="passes_D" header="P D -2" :sortable="true">
      <template #body="slotProps">
        {{ slotProps.data.passes_D[2] }}
      </template>
    </Column>
    <Column field="points" header="Points" :sortable="true"></Column>
    <Column field="defenses" header="Defenses" :sortable="true"></Column>
    <Column field="played_points" header="Played Points" :sortable="true"></Column>
    <Column field="played_time" header="Played Time" :sortable="true">
      <template #body="slotProps">
        <PlayedTimeCell :value="slotProps.data.played_time" />
      </template>
    </Column>
    <Column field="targets" header="Targets">
      <template #body="slotProps">
        <TargetsCell :value="slotProps.data.targets" />
      </template>
    </Column>
    <Column field="providers" header="Providers">
      <template #body="slotProps">
        <TargetsCell :value="slotProps.data.providers" />
      </template>
    </Column>
    <Column field="passesType" header="Passes Type">
      <template #body="slotProps">
        <TargetsCell :value="slotProps.data.passesType" />
      </template>
    </Column>
    <Column field="pulls" header="Pulls" :sortable="true"></Column>
    <Column field="pickUps" header="Pick Ups" :sortable="true"></Column>
  </DataTable>
</template>

<style scoped>
.select-full-height {
  height: 90vh;
}

.stat_viewer :deep(td),
.stat_viewer :deep(th) {
  padding: 10px;
}
</style>

<script setup lang="ts">
import { DataTable, Column, Row } from 'primevue'
import { ref, watch, type Ref } from 'vue'
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
  passes_D: [number, number, number]
  points: number
  defenses: number
  played_points: number
  played_time: number
  targets: StringNumberMap
  providers: StringNumberMap
  passesType: StringNumberMap
  long_success: number
  long_fail: number
  pulls: number
  pickUps: number
  offensives_points: [number, number]
  defensives_points: [number, number]
}

const rows = ref<Row[]>([])
const initStats = (r: Row[]) => {
  r.splice(0, r.length)
  const teamNames = teamStore.teams.map((t) => t.name)
  teamNames.forEach((t) => {
    r.push(initRow(t))
  })

  teamStore.players.forEach((p) => {
    if (teamNames.includes(p.name)) return
    r.push(initRow(p.name))
  })
}
const initRow = (name: string) => {
  return {
    player: name,
    passes_total: 0,
    passes_success: 0,
    passes_fail: 0,
    passes_D: [0, 0, 0] as [number, number, number],
    points: 0,
    defenses: 0,
    played_points: 0,
    played_time: 0,
    targets: new StringNumberMap(),
    providers: new StringNumberMap(),
    passesType: new StringNumberMap(),
    long_success: 0,
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
  players.forEach((p) => {
    emptyMap.set(p, initRow(p))
  })

  return emptyMap
}

const getStatsForOnePoint = (records: JournalEntry[]) => {
  const baseValues = initMap()
  records.forEach((r, i) => {
    if (r.type === jet.PLAYER) {
      const thrower = teamStore.getPlayerByName(r.name)!
      for (let j = i + 1; j < records.length; j++) {
        if (records[j].type === jet.PLAYER) {
          const receiver = teamStore.getPlayerByName(records[j].name)!
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
          baseValues.get(thrower.name)!.passes_total += 1
          baseValues.get(thrower.name)!.passesType.increment(passType)
          const isLong = passModifiers.has('longue')
          const success = teamStore.getPlayerTeam(thrower) === teamStore.getPlayerTeam(receiver)

          if (success) {
            baseValues.get(thrower.name)!.passes_success += 1
            if (isLong) {
              baseValues.get(thrower.name)!.long_success += 1
            }
          } else {
            baseValues.get(thrower.name)!.passes_fail += 1
            if (isLong) {
              baseValues.get(thrower.name)!.long_fail += 1
            }
          }
          //count receivers
          baseValues.get(thrower.name)!.targets.increment(receiver.name)
          //count providers
          baseValues.get(receiver.name)!.providers.increment(thrower.name)
          break
        } else if (records[j].name === 'pull') {
          baseValues.get(thrower.name)!.pulls += 1
          break
        } else if (records[j].name === 'pick up disc') {
          baseValues.get(thrower.name)!.pickUps += 1
          // no break needed, same player has disc
        }
      }
    } else if (r.name === 'score') {
      // get scorer
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          baseValues.get(records[j].name)!.points += 1
          const scoreTeam = teamStore.getPlayerTeam(teamStore.getPlayerByName(records[j].name)!)
          // get passe D
          let pass_D_level = 0
          for (let k = j - 1; k >= 0; k--) {
            if (records[k].type === jet.PLAYER) {
              // calahan is counted as a pass D
              const passerTeam = teamStore.getPlayerTeam(
                teamStore.getPlayerByName(records[k].name)!,
              )
              if (passerTeam != scoreTeam) {
                break
              }
              baseValues.get(records[k].name)!.passes_D[pass_D_level] += 1
              pass_D_level += 1
              if (pass_D_level > 3) {
                break
              }
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
  const team_0_stats = baseValues.get(teamStore.teams[0].name)!
  const teamNames = teamStore.teams.map((t) => t.name)
  baseValues.forEach((r) => {
    if (!teamNames.includes(r.player)) {
      team_0_stats.passes_total += r.passes_total
      team_0_stats.passes_success += r.passes_success
      team_0_stats.passes_fail += r.passes_fail
      for (let i = 0; i < r.passes_D.length; i++) {
        team_0_stats.passes_D[i] += r.passes_D[i]
      }
      team_0_stats.points += r.points
      team_0_stats.defenses += r.defenses
      team_0_stats.pulls += r.pulls
      team_0_stats.pickUps += r.pickUps
      team_0_stats.long_success += r.long_success
      team_0_stats.long_fail += r.long_fail

      r.targets.forEach((v, k) => {
        team_0_stats.targets.set(k, team_0_stats.targets.getOrDefault(k) + v)
      })
      r.providers.forEach((v, k) => {
        team_0_stats.providers.set(k, team_0_stats.providers.getOrDefault(k) + v)
      })
      r.passesType.forEach((v, k) => {
        team_0_stats.passesType.set(k, team_0_stats.passesType.getOrDefault(k) + v)
      })
    }
  })
  team_0_stats.played_time = baseValues.get(teamStore.teams[1].name)!.played_time
  team_0_stats.played_points = baseValues.get(teamStore.teams[1].name)!.played_points

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
  const statsMap = initMap()
  if (journalStore.recordsAsPoints?.length === 0) return
  const pointsForStats = getPointsForStats(journalStore.recordsAsPoints)
  pointsForStats.forEach((p) => {
    const pointStats = getStatsForOnePoint(p.records)
    pointStats.forEach((r) => {
      const playerTotalStats = statsMap.get(r.player)!
      playerTotalStats.passes_total += r.passes_total
      playerTotalStats.passes_success += r.passes_success
      playerTotalStats.passes_fail += r.passes_fail
      for (let i = 0; i < r.passes_D.length; i++) {
        playerTotalStats.passes_D[i] += r.passes_D[i]
      }
      playerTotalStats.points += r.points
      playerTotalStats.defenses += r.defenses
      playerTotalStats.pulls += r.pulls
      playerTotalStats.pickUps += r.pickUps
      playerTotalStats.played_points += r.played_points
      playerTotalStats.played_time += r.played_time
      playerTotalStats.long_success += r.long_success
      playerTotalStats.long_fail += r.long_fail
      r.targets.forEach((v, k) => {
        playerTotalStats.targets.set(k, playerTotalStats.targets.getOrDefault(k) + v)
      })
      r.providers.forEach((v, k) => {
        playerTotalStats.providers.set(k, playerTotalStats.providers.getOrDefault(k) + v)
      })
      r.passesType.forEach((v, k) => {
        playerTotalStats.passesType.set(k, playerTotalStats.passesType.getOrDefault(k) + v)
      })
    })
  })

  // update the grid
  rows.value = rows.value.map((r) => statsMap.get(r.player)!)
  console.log('updateStatGrid')
}

watch(journalStore.sortedRecords, () => {
  console.log('watch journalStore.sortedRecords')
  updateStatGrid()
})

defineExpose({
  setVideoPlayerRef,
})
</script>
