<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import { useKeyboardStore } from '../stores/keyboardStore'
import { onMounted, onBeforeUnmount } from 'vue'
import { playersSelectorShortcutManagerName } from './interfaces/ShortcutTarget'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)
const keyboardStore = useKeyboardStore()

const handleGetFocus = () => {
  keyboardStore.forbidShortcuts()
}

const handleLosseFocus = () => {
  keyboardStore.allowShortcuts()
}

onMounted(() => {
  handleGetFocus()
})

onBeforeUnmount(() => {
  handleLosseFocus()
})

const handleKeyDown = (player, event: KeyboardEvent) => {
  event.preventDefault()
  const currentTargetName = keyboardStore.getKeyBinding(event.code)
  if (currentTargetName && currentTargetName !== playersSelectorShortcutManagerName) {
    window.alert(`This key is already assigned to ${currentTargetName}. Please choose another key.`)
    return
  }
  keyboardStore.addKeyBinding(event.code, playersSelectorShortcutManagerName)
  assignKeyOrModifier(player, event.code, player.modifiers)
}

const assignKeyOrModifier = (player, keyCode: string, modifiers: Set<string>) => {
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

const handleModifierChange = (player, event: Event) => {
  const checkbox = event.target as HTMLInputElement
  console.log('checkbox checked', checkbox.checked, player.name, player.key_code)

  const newModifiers = checkbox.checked ? new Set(['NumpadEnter']) : new Set()

  const success = assignKeyOrModifier(player, player.key_code, newModifiers)
  if (!success) {
    checkbox.checked = !checkbox.checked
  }
}
</script>

<template>
  <form>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Number</th>
          <th>Key Code</th>
          <th>Modifiers</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in players" :key="player.id">
          <td>
            <sl-input v-model="player.name" />
          </td>
          <td>
            <sl-input v-model="player.number" type="number" />
          </td>
          <td>
            <sl-input v-model="player.key_code" @keydown="handleKeyDown(player, $event)" />
          </td>
          <td>
            <label v-if="player.key_code" for="option1">
              <input
                type="checkbox"
                :checked="player.modifiers?.size > 0"
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
  align-items: center;
}

.sl-input {
  margin-bottom: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  color: #615555;
}

thead tr {
  background-color: #009879;
  color: #ffffff;
  text-align: left;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}

th,
td {
  padding: 12px 15px;
}

tbody tr {
  border-bottom: 1px solid #dddddd;
}

tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

tbody tr:hover {
  border-color: #615555;
  cursor: pointer;
  font: bolder;
}
</style>
