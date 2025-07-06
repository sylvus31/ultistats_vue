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
import RevoGrid from '@revolist/vue3-datagrid'
import { useTeamStore } from '@/stores/Team'
import { useJournalStore } from '@/stores/journal'
import { JournalEntryType as jet } from '@/types/journaltypes'
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
  { prop: 'played_points', name: 'Nb points' },
  { prop: 'played_time', name: 'Temps' },
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
}

const rows = ref<Row[]>([])
const initStats = (r: Row[]) => {
  r.splice(0, r.length)

  teamStore.players.forEach((p) => {
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
  }
}

initStats(rows.value)

journalStore.$subscribe((mutation, state) => {
  console.log('Journal store updated:', journalStore.records.length)
  const records = journalStore.records.sort((a, b) => (a.ts === b.ts ? a.id - b.id : a.ts - b.ts))
  const updatedRows = new Map<string, Row>()

  rows.value.forEach((r) => {
    updatedRows.set(r.player, initRow(r.player))
  })
  console.log('before', updatedRows.get('ADVERSAIRE')?.passes_success)

  records.forEach((r, i) => {
    if (r.type === jet.PLAYER) {
      console.log('player', r.name, i)
      for (let j = i + 1; j < records.length; j++) {
        if (records[j].type === jet.PLAYER) {
          updatedRows.get(records[i].name)!.passes_total += 1

          // ADVERSAIRE
          if (records[i].name === 'ADVERSAIRE') {
            if (records[j].name === 'ADVERSAIRE') {
              updatedRows.get(records[i].name)!.passes_success += 1
            } else {
              updatedRows.get(records[i].name)!.passes_fail += 1
            }
          } else {
            if (records[j].name === 'ADVERSAIRE') {
              updatedRows.get(records[i].name)!.passes_fail += 1
            } else {
              updatedRows.get(records[i].name)!.passes_success += 1
            }
          }
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
          let pullTime = line.ts
          for (let k = j + 1; k < records.length; k++) {
            if (records[k].name === 'pull') {
              pullTime = records[k].ts
              break
            }
          }
          const time = records[i].ts - pullTime // not correct, must look for pull
          line.players.forEach((p) => {
            updatedRows.get(p)!.played_points += 1
            updatedRows.get(p)!.played_time += time
          })
          break
        }
      }
    } else if (['block', 'intercept'].includes(r.name)) {
      for (let j = i - 1; j >= 0; j--) {
        console.log('looking for interceptor')
        if (records[j].type === jet.PLAYER) {
          updatedRows.get(records[j].name)!.defenses += 1
          break
        }
      }
    }
  })

  rows.value = rows.value.map((r) => updatedRows.get(r.player)!)

  console.log('after', updatedRows.get('ADVERSAIRE')?.passes_success)

  const grid = document.querySelector('revo-grid')
  if (grid) {
    grid.refresh()
  }
})
</script>
