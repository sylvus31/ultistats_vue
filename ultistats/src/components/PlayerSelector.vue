<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Player } from '@/types/Player'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { useKeyboardStore } from '../stores/keyboardStore'
import { useJournalStore } from '@/stores/journal'
import type { ShortcutTarget } from './interfaces/ShortcutTarget'
import { playersSelectorShortcutManagerName } from './interfaces/ShortcutTarget'
import { useTeamStore } from '@/stores/Team'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)

const keyboardStore = useKeyboardStore()
const componentId = 'PlayerSelector'

keyboardStore.addKeyBinding(componentId, 'NumpadEnter', 'modifier for players', noAction)

function noAction(event: string, activeModifiers: Set<string>) {
  console.log('no action', event, activeModifiers)
}

const selectPlayer = (player: Player) => {
  useTeamStore().selectActivePlayer(player.id)
  useJournalStore().addPlayerEntry(player.id)
}

const playersSelectorShortcutManager: ShortcutTarget = {
  message() {
    const player = teamStore.getPlayerByKeyCodeAndModifiers(eventCode, activeModifiers)

    return 'player: ' + (player ? player.name : 'unknown')
  },

  callback(eventCode: string, activeModifiers: Set<string>) {
    const player = teamStore.getPlayerByKeyCodeAndModifiers(eventCode, activeModifiers)
    if (player) {
      selectPlayer(player)
    }
  },

  setShortcut(eventCode: string) {
    const player = teamStore.getPlayerByKeyCodeAndModifiers(eventCode)
    if (player) {
      player.key_code = eventCode
    }
  },

  removeShortcut(eventCode: string, activeModifiers: Set<string>) {
    const player = teamStore.getPlayerByKeyCodeAndModifiers(eventCode, activeModifiers)
    if (player) {
      player.key_code = ''
      player.modifiers = new Set()
    }
  },
}

keyboardStore.registerShortcutTarget(
  playersSelectorShortcutManagerName,
  playersSelectorShortcutManager,
)
players.value.forEach((p) => {
  if (p.key_code) {
    keyboardStore.addKeyBinding(p.key_code, playersSelectorShortcutManagerName)
  }
})

defineExpose({ playersSelectorShortcutManager })
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
              { 'opponent-name': teamStore.getPlayerTeam(player) == 1 },
            ]"
            >{{ player.name }}</span
          >
        </div>
        <div>
          <span class="player-key" v-if="player.modifiers?.size > 0">
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
