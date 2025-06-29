<script setup lang="ts">
import LineSelector from './LineSelector.vue'
import { useJournalStore } from '../stores/journal'
import { ref } from 'vue'
import { useTeamStore } from '../stores/Team'

const teamStore = useTeamStore()

const showLineSelector = ref(false)
const journalStore = useJournalStore()
const setLine = () => {
  if (showLineSelector.value) {
    // closing line selector => save line
    journalStore.addLineEntry(new Set(teamStore.playingPlayers.map((p) => p.name)))
  }
  showLineSelector.value = !showLineSelector.value
}
</script>
<template>
  <button @click="setLine()" class="pass-modifier-button">
    <span class="pass-modifier-name">Set line</span>
  </button>
  <LineSelector v-show="showLineSelector" />
</template>

<style scoped>
.pass-modifier-name {
  font-weight: bold;
  color: #00bcd4;
}
.pass-modifier-button {
  margin-left: 10px;
  padding: 2px 4px;
  min-width: 50px;
  max-width: 100px;
  background-color: #333; /* Dark background */
  color: #e0e0e0; /* Light text */
  border-radius: 15px;
  border: 2px solid #444; /* Darker border */
}
.pass-modifier-button.active {
  border: 2px solid #00bcd4; /* Techy teal accent for active */
  background-color: #2a4a52; /* Darker teal background for active */
}
.pass-modifier-button:hover:not(.active) {
  background-color: #444; /* Slightly lighter on hover */
}
</style>
