<template>
  <div class="buttons">
    <sl-button
      v-for="player in players"
      :key="player.id"
      @click="selectPlayer(player)"
      :class="{ active: player.isActive }"
    >
      <span v-if="player.number">{{ player.number }} / </span>
      <span class="player-name">{{ player.name }}</span>
      <span v-if="player.key"> [{{ player.key }}]</span>
    </sl-button>
  </div>
</template>

<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import type { Player } from '@/types/Player'
import '@shoelace-style/shoelace/dist/components/button/button.js'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)

const selectPlayer = (player: Player) => {
  teamStore.selectActivePlayer(player.id)
}
</script>

<style scoped>
.player-name {
  font-weight: bold;
  color: #00bcd4;
}
sl-button::part(base) {
  justify-content: center;
  width: 150px;
}
.buttons {
  display: flexbox;
  flex-wrap: wrap;
}
</style>
