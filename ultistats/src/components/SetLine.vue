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
  <sl-button @click="setLine()" class="pass-modifier-button">
    <span class="pass-modifier-name">Set line</span>
  </sl-button>
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
}

</style>
