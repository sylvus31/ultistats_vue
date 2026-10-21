<script setup lang="ts">
import LineEditorDialog from './LineEditorDialog.vue'
import { useJournalStore } from '../stores/journal'
import { ref } from 'vue'
import { useTeamStore } from '../stores/Team'
import { JournalEntryType } from '@/types/journaltypes'

const teamStore = useTeamStore()
const journalStore = useJournalStore()
const lineEditor = ref<InstanceType<typeof LineEditorDialog> | null>(null)

const openLineSelector = () => {
  const latestLine = [...journalStore.sortedRecords]
    .reverse()
    .find((record) => record.type === JournalEntryType.LINE && 'players' in record)

  lineEditor.value?.open(
    latestLine && 'players' in latestLine
      ? latestLine.players
      : new Set(teamStore.playingPlayers.map((player) => player.id)),
  )
}

const saveLine = (players: Set<string>) => {
  const teamIds = teamStore.teams.map((team) => team.id)
  teamStore.players
    .filter((player) => !teamIds.includes(player.id))
    .forEach((player) => teamStore.setPlayingStatus(player.id, players.has(player.id)))
  journalStore.addLineEntry(players)
}
</script>
<template>
  <sl-button @click="openLineSelector" class="pass-modifier-button">
    <span class="pass-modifier-name">Set line</span>
  </sl-button>
  <LineEditorDialog ref="lineEditor" @save="saveLine" />
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
