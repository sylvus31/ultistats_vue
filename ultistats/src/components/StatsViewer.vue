<template>
  <RevoGrid
    id="revo-grid"
    hide-attribution
    :columns="columns"
    :source="rows"
    :theme="'darkCompact'"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RevoGrid, { VGridVueTemplate } from '@revolist/vue3-datagrid'
import { useTeamStore } from '@/stores/Team'
import { useJournalStore } from '@/stores/journal'
import { JournalEntryType as jet, type journalPass } from '@/types/journaltypes'
import PlayedTimeCell from './stats/PlayedTimeCell.vue'
import TargetsCell from './stats/TargetsCell.vue'
const teamStore = useTeamStore()
const journalStore = useJournalStore()
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
])

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
  targets: Map<string, number>
  providers: Map<string, number>
  passesType: Map<string, number>
  longue_success: number
  long_fail: number
}

const rows = ref<Row[]>([])
const initStats = (r: Row[]) => {
  r.splice(0, r.length)

  teamStore.players.forEach((p) => {
    r.push(initRow(p.name))
  })
  r.push(initRow('BTR'))
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
    targets: new Map<string, number>(),
    providers: new Map<string, number>(),
    passesType: new Map<string, number>(),
    longue_success: 0,
    long_fail: 0,
  }
}

initStats(rows.value)

journalStore.$subscribe((mutation, state) => {
  const records = journalStore.records.sort((a, b) => (a.ts === b.ts ? a.id - b.id : a.ts - b.ts))
  const updatedRows = new Map<string, Row>()

  rows.value.forEach((r) => {
    updatedRows.set(r.player, initRow(r.player))
  })

  records.forEach((r, i) => {
    if (r.type === jet.PLAYER) {
      const thrower = r.name
      for (let j = i + 1; j < records.length; j++) {
        if (records[j].type === jet.PLAYER) {
          // TODO: pull are contount as passes
          const receiver = records[j].name
          updatedRows.get(thrower)!.passes_total += 1
          //get type of pass
          let long = false
          for (let k = i + 1; k < j; k++) {
            if (records[k].type === jet.PASS) {
              const pass = records[k] as journalPass
              updatedRows
                .get(thrower)!
                .passesType.set(
                  pass.name,
                  (updatedRows.get(thrower)!.passesType.get(pass.name) || 0) + 1,
                )
              long = pass.modifiers.has('long')
              break
            }
          }

          const success =
            (thrower === 'ADVERSAIRE' && receiver === 'ADVERSAIRE') ||
            (thrower !== 'ADVERSAIRE' && receiver !== 'ADVERSAIRE')

          if (success) {
            updatedRows.get(thrower)!.passes_success += 1
            if (long) {
              updatedRows.get(thrower)!.longue_success += 1
            }
          } else {
            updatedRows.get(thrower)!.passes_fail += 1
            if (long) {
              updatedRows.get(thrower)!.long_fail += 1
            }
          }
          //count receivers
          updatedRows
            .get(thrower)!
            .targets.set(receiver, (updatedRows.get(thrower)!.targets.get(receiver) || 0) + 1)
          //count providers
          updatedRows
            .get(receiver)!
            .providers.set(thrower, (updatedRows.get(receiver)!.providers.get(thrower) || 0) + 1)
          break
        } else if (records[j].type === jet.EVENT || ['score'].includes(records[j].name)) {
          break
        }
      }
    } else if (r.name === 'score') {
      // get scorer
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          updatedRows.get(records[j].name)!.points += 1
          // get passe D
          for (let k = j - 1; k >= 0; k--) {
            if (records[k].type === jet.PLAYER) {
              updatedRows.get(records[k].name)!.passes_D += 1
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
            updatedRows.get(p)!.played_points += 1
            updatedRows.get(p)!.played_time += time
          })
          break
        }
      }
    } else if (['block', 'intercept'].includes(r.name)) {
      for (let j = i - 1; j >= 0; j--) {
        if (records[j].type === jet.PLAYER) {
          updatedRows.get(records[j].name)!.defenses += 1
          break
        }
      }
    }
  })

  //add BTR line
  const btrStats = initRow('BTR')
  updatedRows.forEach((r) => {
    if (r.player !== 'ADVERSAIRE') {
      btrStats.passes_total += r.passes_total
      btrStats.passes_success += r.passes_success
      btrStats.passes_fail += r.passes_fail
      btrStats.passes_D += r.passes_D
      btrStats.points += r.points
      btrStats.defenses += r.defenses
      btrStats.played_points += r.played_points

      r.targets.forEach((v, k) => {
        btrStats.targets.set(k, (btrStats.targets.get(k) || 0) + v)
      })
      r.providers.forEach((v, k) => {
        btrStats.providers.set(k, (btrStats.providers.get(k) || 0) + v)
      })
      r.passesType.forEach((v, k) => {
        btrStats.passesType.set(k, (btrStats.passesType.get(k) || 0) + v)
      })
    }
  })
  btrStats.played_time += updatedRows.get('ADVERSAIRE')!.played_time
  updatedRows.set('BTR', btrStats)
  rows.value = rows.value.map((r) => updatedRows.get(r.player)!)

  const grid = document.querySelector('revo-grid')
  if (grid) {
    grid.refresh()
  }
})
</script>
