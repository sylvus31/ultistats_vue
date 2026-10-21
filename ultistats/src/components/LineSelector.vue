<script setup lang="ts">
import { computed } from 'vue'
import { useTeamStore } from '../stores/Team'

const selectedPlayers = defineModel<Set<string>>({ required: true })
const playerStore = useTeamStore()
const fieldPlayers = computed(() =>
  playerStore.players.filter((player) => !playerStore.teams.some((team) => team.id === player.id)),
)
const playingPlayers = computed(() =>
  fieldPlayers.value.filter((player) => selectedPlayers.value.has(player.id)),
)
const nonPlayingPlayers = computed(() =>
  fieldPlayers.value.filter((player) => !selectedPlayers.value.has(player.id)),
)

const setPlaying = (playerId: string, playing: boolean) => {
  const players = new Set(selectedPlayers.value)
  if (playing) {
    players.add(playerId)
  } else {
    players.delete(playerId)
  }
  selectedPlayers.value = players
}
</script>

<template>
  <div class="lists-container">
    <div class="list">
      <h3>Playing</h3>
      <ul>
        <li
          v-for="player in playingPlayers"
          :key="player.id"
          @click="setPlaying(player.id, false)"
        >
          {{ player.name }}
        </li>
      </ul>
    </div>
    <div class="list">
      <h3>Not Playing</h3>
      <ul>
        <li
          v-for="player in nonPlayingPlayers"
          :key="player.id"
          @click="setPlaying(player.id, true)"
        >
          {{ player.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.lists-container {
  display: flex;
  gap: var(--spacing-lg);
}
.list {
  flex: 1;
  min-width: 0;
}

.list h3 {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.list ul {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.list li {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-darker-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.list li:hover {
  border-color: var(--color-accent);
  background-color: var(--color-card-bg);
}

@media (max-width: 480px) {
  .lists-container {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
