<template>
  <button
    v-for="player in players"
    :key="player.id"
    @click="selectPlayer(player)"
    :class="{ active: player.isActive }"
  >
    <span v-if="player.number">{{ player.number }} / </span>
    <span class="player-name">{{ player.name }}</span>
    <span v-if="player.key"> [{{ player.key }}]</span>
  </button>
</template>

<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import type { Player } from '@/types/Player'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)

const selectPlayer = (player: Player) => {
  teamStore.selectActivePlayer(player.id)
}
</script>

<style scoped>
.player-name {
  font-weight: bold;
  color: dodgerblue;
}
button.active {
  border: 3px solid dodgerblue;
}

button {
  margin: 5px;
  padding: 5px 10px;
  min-width: 100px;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #ccc;
}
</style>
