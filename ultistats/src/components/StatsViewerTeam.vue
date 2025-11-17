<script setup lang="ts">
import { computed } from 'vue'
import { useTeamStore } from '@/stores/Team'
import { useJournalStore, type JournalEntry } from '@/stores/journal'

const journalStore = useJournalStore()
const teamStore = useTeamStore()

const storyLine = computed(() => {
  // if (journalStore.recordsAsPoints?.length === 0) return
  const story: [string, string] = ['a a ', ' b b ']
  journalStore.recordsAsPoints.forEach((record) => {})

  return story
})
</script>
<template>
  <table>
    <tbody>
    <tr>
      <td v-for="(char, index) in storyLine[0]" :key="index" style="color: green">{{ char }}</td>
    </tr>
    <tr>
      <td v-for="(char, index) in storyLine[1]" :key="index" style="color: red">{{ char }}</td>
    </tr>
    </tbody>
  </table>
</template>
