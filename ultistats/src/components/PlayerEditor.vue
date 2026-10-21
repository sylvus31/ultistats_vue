<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import { createPlayer, type Player } from '@/types/Player'
import { useKeyboardStore } from '../stores/keyboardStore'
import { playersSelectorShortcutManagerName } from './interfaces/ShortcutTarget'
import { formatShortcutKey, getKeyboardShortcutKey } from '@/types/keyConstants'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)
const keyboardStore = useKeyboardStore()
let nextPlayerId = 1

const createNewPlayerId = () => {
  let id = ''
  do {
    id = `new-player-${nextPlayerId++}`
  } while (players.value.some((player) => player.id === id))
  return id
}

const createPlayerDraft = () => createPlayer(createNewPlayerId(), '', undefined, new Set<string>())
const newPlayerDraft = ref<Player>(createPlayerDraft())
const editorPlayers = computed(() => [...players.value, newPlayerDraft.value])

watch(
  () => newPlayerDraft.value.name,
  async (name) => {
    if (!name.trim()) return
    const promotedPlayer = newPlayerDraft.value
    teamStore.teams[0].players.push(promotedPlayer)
    newPlayerDraft.value = createPlayerDraft()
    await nextTick()
    document.querySelector<HTMLElement>(`sl-input[data-player-id="${promotedPlayer.id}"]`)?.focus()
  },
)

const handleGetFocus = () => {
  keyboardStore.forbidShortcuts()
}

const handleLosseFocus = () => {
  keyboardStore.allowShortcuts()
}

const synchronizePlayerBindings = () => {
  keyboardStore.removeKeyBindingsFor(playersSelectorShortcutManagerName)
  players.value.forEach((player) => {
    if (player.key_code) {
      keyboardStore.addKeyBinding(player.key_code, playersSelectorShortcutManagerName)
    }
  })
}

onMounted(() => {
  handleGetFocus()
  synchronizePlayerBindings()
})

onBeforeUnmount(() => {
  handleLosseFocus()
})

const handleKeyDown = (player: Player, event: KeyboardEvent) => {
  event.preventDefault()
  const key = getKeyboardShortcutKey(event)
  if (keyboardStore.isReservedShortcutKey(key)) {
    window.alert(`${formatShortcutKey(key)} is reserved for video controls.`)
    return
  }
  const currentTargetName = keyboardStore.getKeyBinding(key)
  if (currentTargetName && currentTargetName !== playersSelectorShortcutManagerName) {
    window.alert(`This key is already assigned to ${currentTargetName}. Please choose another key.`)
    return
  }
  if (assignKeyOrModifier(player, key, player.modifiers ?? new Set())) {
    synchronizePlayerBindings()
  }
}

const handlePlayerModifierKeyDown = (event: KeyboardEvent) => {
  event.preventDefault()
  const key = getKeyboardShortcutKey(event)
  if (key === keyboardStore.playerModifierKey) {
    return
  }

  if (keyboardStore.isReservedShortcutKey(key)) {
    window.alert(`${formatShortcutKey(key)} is reserved for video controls.`)
    return
  }

  const assignedTarget = keyboardStore.getKeyBinding(key)
  if (assignedTarget) {
    window.alert(`This key is already assigned to ${assignedTarget}. Please choose another key.`)
    return
  }

  const previousKey = keyboardStore.playerModifierKey
  keyboardStore.setPlayerModifierKey(key)
  players.value.forEach((player) => {
    if (player.modifiers?.has(previousKey)) {
      player.modifiers = new Set(
        [...player.modifiers].map((modifier) => (modifier === previousKey ? key : modifier)),
      )
    }
  })
}

const assignKeyOrModifier = (player: Player, keyCode: string, modifiers: Set<string>) => {
  console.log('assignKeyOrModifier', player.name, keyCode, modifiers)
  const otherPlayer = teamStore.getPlayerByKeyCodeAndModifiers(keyCode, modifiers)

  if (otherPlayer && otherPlayer.id !== player.id) {
    const result = window.confirm(
      `This key combination is already assigned to ${otherPlayer.name}. Do you want to reassign it to ${player.name}?`,
    )
    if (result) {
      otherPlayer.key_code = player.key_code
      otherPlayer.modifiers = player.modifiers
      player.key_code = keyCode
      player.modifiers = modifiers
      return true
    }
    return false
  } else {
    player.key_code = keyCode
    player.modifiers = modifiers
    return true
  }
}

const handleModifierChange = (player: Player, event: Event) => {
  const checkbox = event.target as HTMLInputElement
  console.log('checkbox checked', checkbox.checked, player.name, player.key_code)

  const newModifiers = checkbox.checked
    ? new Set([keyboardStore.playerModifierKey])
    : new Set<string>()

  const success = assignKeyOrModifier(player, player.key_code ?? '', newModifiers)
  if (success) {
    synchronizePlayerBindings()
  } else {
    checkbox.checked = !checkbox.checked
  }
}

const clearShortcut = (player: Player) => {
  player.key_code = ''
  player.modifiers = new Set()
  synchronizePlayerBindings()
}

const removeEmptyPlayer = (player: Player) => {
  teamStore.removePlayer(player.id)
  synchronizePlayerBindings()
}

const isRosterPlayer = (player: Player) =>
  teamStore.teams.some((team) => team.players.some((rosterPlayer) => rosterPlayer.id === player.id))
</script>

<template>
  <form>
    <div class="modifier-shortcut">
      <label for="player-modifier-key">Player modifier key:</label>
      <sl-input
        id="player-modifier-key"
        :value="formatShortcutKey(keyboardStore.playerModifierKey)"
        @keydown="handlePlayerModifierKeyDown"
      />
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Number</th>
          <th>Shortcut</th>
          <th>Clear</th>
          <th>Remove</th>
          <th>Modifiers</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in editorPlayers" :key="player.id">
          <td>
            <sl-input
              v-model="player.name"
              :data-player-id="player.id"
              :placeholder="player.id === newPlayerDraft.id ? 'new...' : ''"
              :aria-label="
                player.id === newPlayerDraft.id ? 'New player name' : `${player.name} name`
              "
            />
          </td>
          <td>
            <sl-input v-model="player.number" type="number" />
          </td>
          <td>
            <sl-input
              :value="formatShortcutKey(player.key_code)"
              @keydown="handleKeyDown(player, $event)"
            />
          </td>
          <td>
            <button
              type="button"
              class="clear-shortcut"
              :disabled="!player.key_code"
              :aria-label="`Clear ${player.name} shortcut`"
              @click="clearShortcut(player)"
            >
              Clear
            </button>
          </td>
          <td>
            <button
              v-if="
                !player.name.trim() && player.id !== newPlayerDraft.id && isRosterPlayer(player)
              "
              type="button"
              class="remove-entry"
              :aria-label="`Remove empty player entry`"
              title="Remove empty player entry"
              @click="removeEmptyPlayer(player)"
            >
              <span class="mdi mdi-delete-outline" aria-hidden="true"></span>
            </button>
          </td>
          <td>
            <label v-if="player.key_code" for="option1">
              <input
                type="checkbox"
                :checked="(player.modifiers?.size ?? 0) > 0"
                @change="handleModifierChange(player, $event)"
              />
            </label>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.sl-input {
  margin-bottom: 10px;
}

.modifier-shortcut {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.modifier-shortcut .sl-input {
  width: 180px;
  margin-bottom: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  min-width: 400px;
  color: var(--color-text-primary);
}

thead tr {
  background-color: var(--color-darker-bg);
  color: var(--color-text-light);
  text-align: left;
}

thead th {
  border-bottom: 2px solid var(--color-border);
}

th,
td {
  padding: var(--spacing-sm) var(--spacing-md);
}

tbody tr {
  border-bottom: 1px solid var(--color-border);
}

tbody tr:nth-of-type(even) {
  background-color: var(--color-darker-bg);
}

tbody tr:hover {
  background-color: var(--color-border);
}

input[type='checkbox'] {
  accent-color: var(--color-accent);
}

.clear-shortcut {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.clear-shortcut:disabled {
  cursor: default;
  opacity: 0.5;
}

.remove-entry {
  padding: var(--spacing-sm);
  color: var(--color-text-primary);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 1.1rem;
}

.remove-entry:hover {
  color: var(--color-accent);
}
</style>
