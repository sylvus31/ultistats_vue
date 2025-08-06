<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import type { Player } from '@/types/Player'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { useKeyboardStore } from '../stores/keyboardStore'
import { useJournalStore } from '@/stores/journal'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)

const journalStore = useJournalStore()

const selectPlayer = (player: Player) => {
  teamStore.selectActivePlayer(player.id)
  journalStore.addPlayerEntry(player.name)
}

const keyboardStore = useKeyboardStore()
const componentId = 'PlayerSelector'

players.value.forEach((p) => {
  if (p.key_code) {
    keyboardStore.addKeyBinding(componentId, p.key_code, 'player: ' + p.name, logPlayer)
  }
})

keyboardStore.addKeyBinding(componentId, 'NumpadEnter', 'modifier for players', noAction)

function noAction(event: string, activeModifiers: Set<string>) {
  console.log('no action', event, activeModifiers)
}

function logPlayer(eventCode: string, activeModifiers: Set<string>) {
  const player = teamStore.getPlayerByKeyCodeAndModifiers(eventCode, activeModifiers)
  if (player) {
    teamStore.selectActivePlayer(player.id)
    journalStore.addPlayerEntry(player.name)
  }
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
      <div class="player-button-content">
        <div>
          <span v-if="player.number">{{ player.number }} : </span>
          <span
            :class="[
              { 'player-name-playing': player.playing },
              { 'opponent-name': player.name === 'ADVERSAIRE' },
            ]"
            >{{ player.name }}</span
          >
        </div>
        <div>
          <span class="player-key" v-if="player.modifiers">
            [{{ Array.from(player.modifiers).join(',') }}]</span
          >
          <span class="player-key" v-if="player.key_code"> [{{ player.key_code }}]</span>
        </div>
      </div>
    </sl-button>
  </div>
</template>

<style scoped>
.player-name-playing {
  font-weight: bold;
  color: #00bcd4;
}

.opponent-name {
  font-weight: bold;
  color: #b05959;
}
.player-key {
  font-size: 0.8em;
}
sl-button::part(base) {
  width: 150px;
  height: 50px;
}
.buttons {
  display: flexbox;
  flex-wrap: wrap;
}
.player-button-content {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Vertically centers content */
  height: 100%; /* Ensure the container fills the parent's height */
}
</style>
