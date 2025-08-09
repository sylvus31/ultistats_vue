<script lang="ts" setup>
import { useKeyboardStore } from '../stores/keyboardStore'
import { useJournalStore } from '@/stores/journal'

const journalStore = useJournalStore()
const keyboardStore = useKeyboardStore()

const componentId = 'FileSaver'

const handleGetFocus = () => {
  keyboardStore.requestFocus(componentId)
}

const handleLosseFocus = () => {
  keyboardStore.freeFocus()
}

const saveFile = () => {
  const data = JSON.stringify(journalStore.records, (_key, value) =>
    value instanceof Set ? [...value] : value,
  )
  const blob = new Blob([data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const teamName_A = document.getElementById('teamName_A') as HTMLInputElement
  const teamName_B = document.getElementById('teamName_B') as HTMLInputElement
  a.download = teamName_A.value + '_vs_' + teamName_B.value + '.json'
  a.click()
  window.URL.revokeObjectURL(url)
}

const loadFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (journalStore.records.length > 0) {
          const confirmDialog = document.createElement('dialog')
          confirmDialog.style.position = 'absolute'
          confirmDialog.innerHTML = `
  <form method="dialog">
    <h2>Records already exist</h2>
    <p>Do you want to overwrite the existing records or add new ones?</p>
    <menu>
      <button value="overwrite">Overwrite</button>
      <button value="add">Add</button>
      <button value="cancel">Cancel</button>
    </menu>
  </form>
`
          document.body.appendChild(confirmDialog)
          confirmDialog.showModal()
          confirmDialog.addEventListener('close', () => {
            let timOffset = 0
            if (confirmDialog.returnValue === 'cancel') {
              return
            }
            if (confirmDialog.returnValue === 'overwrite') {
              journalStore.records = []
            }
            if (confirmDialog.returnValue === 'add') {
              timOffset = Math.max(...journalStore.records.map((p) => p.ts)) + 3600
            }
            const data = JSON.parse(reader.result as string)
            data.forEach((record: any) => {
              //special treatment for sets stored as array in json
              if (record.modifiers) {
                record.modifiers = new Set(record.modifiers)
              }
              if (record.players) {
                record.players = new Set(record.players)
              }
              record.ts += timOffset
              journalStore.records.push(record)
            })
          })
        } else {
          const data = JSON.parse(reader.result as string)
          data.forEach((record: any) => {
            //special treatment for sets stored as array in json
            if (record.modifiers) {
              record.modifiers = new Set(record.modifiers)
            }
            if (record.players) {
              record.players = new Set(record.players)
            }
            journalStore.records.push(record)
          })
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>

<template>
  <sl-button @click="saveFile">Save File</sl-button>
  <input
    id="teamName_A"
    type="text"
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
    class="styled-input"
    value="BTR"
  />
  VS
  <input
    id="teamName_B"
    type="text"
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
    class="styled-input"
    value="xxx"
  />
  <sl-button @click="loadFile">Load File</sl-button>
</template>
<style scoped>
.styled-input {
  /* Base styling */
  font-family: inherit; /* Inherit font from body */
  font-size: inherit;
  line-height: inherit;
  border: 2px solid #444; /* Match button border */
  border-radius: 5px; /* Match button radius */
  background-color: #333; /* Match button background */
  color: #e0e0e0; /* Match button text color */
  padding: 5px 10px; /* Match button padding */
  margin: 5px; /* Match button margin */
  min-width: 100px; /* Match button min-width */
  width: 300px; /* Specific width */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  height: 38px; /* Explicit height to match button - Adjust if needed */
}

.styled-input:focus {
  border-color: #00bcd4; /* Accent color on focus */
  outline: none; /* Remove default browser outline */
}
</style>
