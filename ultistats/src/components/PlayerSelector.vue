<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import type { Player } from '@/types/Player'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { useKeyboardStore } from '../stores/keyboardStore'
import { onKeyStroke } from '@vueuse/core'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)

const selectPlayer = (player: Player) => {
  teamStore.selectActivePlayer(player.id)
}

const keyboardStore = useKeyboardStore()
const componentId = 'PlayerSelector'

const playerKeys = players.value
  .filter((player) => player.key_code)
  .map((player) => player.key_code as string)

console.log('type of playerKeys', typeof playerKeys)
console.log('playerKeys', playerKeys)
const isPlayerKey = (event: KeyboardEvent) => playerKeys.includes(event.code)
players.value.forEach((p) => {
  if (p.key_code) {
    console.log('binding', p.name, p.key_code)

    keyboardStore.addKeyBinding(componentId, p.key_code, 'player: ' + p.name, logPlayer)
  }
})
function logPlayer(event: KeyboardEvent) {
  console.log('logPlayer called by keystore')
  const player = teamStore.getPlayerByKeyCode(event.code)
  console.log(player?.name)
  console.log(event)
}
</script>

<template>
  <div class="buttons">
    <sl-button
      v-for="player in players"
      :key="player.id"
      @click="selectPlayer(player)"
      :class="{ active: player.isActive }"
    >
      <span v-if="player.number">{{ player.number }} : </span>
      <span class="player-name">{{ player.name }}</span>
      <span class="player-key" v-if="player.key_code"> [{{ player.key_code }}]</span>
    </sl-button>
  </div>
</template>

<style scoped>
.player-name {
  font-weight: bold;
  color: #00bcd4;
}
.player-key {
  font-size: 0.8em;
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
