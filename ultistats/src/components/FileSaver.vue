<script lang="ts" setup>
import { useKeyboardStore } from '../stores/keyboardStore'
import { useJournalStore } from '@/stores/journal'
import { useTeamStore } from '@/stores/Team'
import { onMounted} from 'vue'
import { useInitStore } from '@/stores/init'
import type { Player } from '@/types/Player'
import { createPlayer } from '@/types/Player'

const initStore = useInitStore()


const journalStore = useJournalStore()
const keyboardStore = useKeyboardStore()
const teamStore = useTeamStore()

const componentId = 'FileSaver'

const handleGetFocus = () => {
  keyboardStore.requestFocus(componentId)
}

const handleLosseFocus = () => {
  keyboardStore.freeFocus()
}

const saveFile = () => {
  const records = journalStore.sortedRecords
  const version = '1'
  const videoSrc = initStore.videoSrc
  const teamName_A = document.getElementById('teamName_A') as HTMLInputElement
  const teamName_B = document.getElementById('teamName_B') as HTMLInputElement

  const data = {
    version: version,
    videoSrc: videoSrc,
    teams: [{ name: teamName_A.value, id: teamStore.teams[0].id, players: teamStore.teams[0].players },
    { name: teamName_B.value, id: teamStore.teams[1].id, players: teamStore.teams[1].players }],
    records: records,
  }

  const blobPart = JSON.stringify(data, (_key, value) =>
    value instanceof Set ? [...value] : value,
  )
  const blob = new Blob([blobPart], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
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
        importData(reader.result as string)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const addRecords = (jsonData: any, timOffset: number) => {
  let records = []
  const jsonDataIsObject = typeof jsonData === 'object' && jsonData !== null
  const hasVersionProperty = jsonDataIsObject && 'version' in jsonData

  if (hasVersionProperty) {
    console.log('Detected full save file format, extracting records only')
    records = jsonData.records
  } else {
    records = jsonData
  }
  records.forEach((record: any) => {
    //special processing for sets stored as array in json
    if (record.modifiers) {
      record.modifiers = new Set(record.modifiers)
    }
    if (record.players) {
      record.players = new Set(record.players)
    }
    record.ts += timOffset
    journalStore.addRecord(record)
  })
}

const importData = (data: string) => {
  const jsonData = JSON.parse(data)
  let timOffset = 0

  function setData() {
    for (let index = 0; index < 2; index++) {
      teamStore.setTeamNameAndID(index, jsonData.teams[index].name, jsonData.teams[index].id)

      const players: Array<Player> = []
      jsonData.teams[index].players?.forEach((playerData: any) => {
        players.push(createPlayer(playerData['id'], playerData['name'], playerData['key_code']))
      })

      teamStore.setPlayersOfTeam(index, players)
    }

    addRecords(jsonData, timOffset)

    initStore.videoSrc = jsonData.videoSrc || { uri: '', type: '' }
  }

  if (journalStore.sortedRecords.length > 0) {
    const confirmDialog = document.createElement('dialog')
    confirmDialog.style.position = 'absolute'
    confirmDialog.innerHTML = `
  <form method="dialog">
    <h2>Records already exist</h2>
    <p>Do you want to overwrite the existing records?</p>
    <menu>
      <button value="overwrite">Overwrite</button>
      <!-- <button value="add">Add</button> -->
      <button value="cancel">Cancel</button>
    </menu>
  </form>
`
    document.body.appendChild(confirmDialog)
    confirmDialog.showModal()
    confirmDialog.addEventListener('close', () => {
      if (confirmDialog.returnValue === 'cancel') {
        return
      }
      if (confirmDialog.returnValue === 'overwrite') {
        journalStore.deleteAllRecords()
        teamStore.clearTeams()
      }
      if (confirmDialog.returnValue === 'add') {
        timOffset = Math.max(...journalStore.sortedRecords.map((p) => p.ts)) + 3600
      }
      setData()
    })
  } else {
    setData()
  }
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.has('file')) {
    fetch(`${window.location.origin}/save/${params.get('file')}`)
      .then((response) => response.text())
      .then((data) => {
        importData(data)
      })
  }
})

</script>

<template>
  <sl-button @click="saveFile">Save File</sl-button>
  <input
    id="teamName_A"
    type="text"
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
    class="styled-input"
    v-model="teamStore.teams[0].name"
  />
  VS
  <input
    id="teamName_B"
    v-model="teamStore.teams[1].name"
    type="text"
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
    class="styled-input"
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
