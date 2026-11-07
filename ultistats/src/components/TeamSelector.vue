<script setup lang="ts">
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { useJournalStore } from '@/stores/journal'
import { useTeamStore } from '@/stores/Team'
import { formatShortcutKey } from '@/types/keyConstants'

const teamStore = useTeamStore()

const selectTeam = (teamId: string) => {
  teamStore.selectActivePlayer(teamId)
  useJournalStore().addPlayerEntry(teamId)
}
</script>

<template>
  <sl-button
    v-for="team in teamStore.teams"
    :key="team.id"
    :class="{ active: teamStore.getPlayerByID(team.id)?.isActive }"
    @click="selectTeam(team.id)"
  >
    <span>{{ team.name }}</span>
    <span v-if="teamStore.getPlayerByID(team.id)?.modifiers?.size" class="team-shortcut">
      [{{ Array.from(teamStore.getPlayerByID(team.id)?.modifiers ?? []).join(',') }}]
    </span>
    <span v-if="teamStore.getPlayerByID(team.id)?.key_code">
      [{{ formatShortcutKey(teamStore.getPlayerByID(team.id)?.key_code ?? '') }}]
    </span>
  </sl-button>
</template>
