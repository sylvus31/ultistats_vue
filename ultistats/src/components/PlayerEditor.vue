<script setup lang="ts">
import { useTeamStore } from '@/stores/Team'
import { storeToRefs } from 'pinia'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import { useKeyboardStore } from '../stores/keyboardStore'
import { onMounted, onBeforeUnmount } from 'vue'
import { logPlayer } from './PlayerSelector.vue'

const teamStore = useTeamStore()
const { players } = storeToRefs(teamStore)

const componentId = 'PlayerEditor'

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
  // TODO: implementer une interface pour gerer les cibles de touches et implement dans chaque classe

  event.preventDefault() // Prevent default behavior of the key press
  if (keyboardStore.addKeyBinding(componentId, event.code, 'player: ' + player.name, logPlayer)) {
    player.key_code = event.code
  } else {
    const result = window.confirm(
      'This key is already assigned to ' +
        keyboardStore.getKeyBinding(event.code)?.msg +
        '. Do you want to reassign it to wwww ' +
        player.name +
        '?',
    )
    if (result) {
      keyboardStore.removeKeyBinding(event.code)
      if (
        keyboardStore.addKeyBinding(componentId, event.code, 'player: ' + player.name, logPlayer)
      ) {
        player.key_code = event.code
      }
    }
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
            <label for="option1">
              <input type="checkbox" />
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
