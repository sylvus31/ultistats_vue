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
teamStore.players.forEach((p) => {
  rows.value.push({
    player: p.name,
    passes_total: 0,
    passes_success: 0,
    passes_fail: 0,
    passes_D: 0,
    points: 0,
    defenses: 0,
    played_points: 0,
    played_time: 0,
  })
})
journalStore.$subscribe((mutation, state) => {
  console.log('Journal store updated:', journalStore.records.length)
  rows.value[0].passes_total = journalStore.records.length
  const grid = document.querySelector('revo-grid')
  if (grid) {
    grid.refresh()
  }
})
</script>
