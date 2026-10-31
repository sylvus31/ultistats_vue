<script lang="ts" setup>
import { useKeyboardStore } from '../stores/keyboardStore'
import { useJournalStore } from '@/stores/journal'
import { useTeamStore } from '@/stores/Team'
import { onMounted } from 'vue'
import { useInitStore } from '@/stores/init'
import type { Player } from '@/types/Player'
import { createPlayer } from '@/types/Player'
import { normalizeShortcutKey } from '@/types/keyConstants'
import { playersSelectorShortcutManagerName } from './interfaces/ShortcutTarget'
import { usePassesStore } from '@/stores/passesStore'
import { useEventsStore } from '@/stores/EventsStore'
import { useActionsStore } from '@/stores/ActionsStore'
import { JournalEntryType } from '@/types/journaltypes'

const initStore = useInitStore()

const journalStore = useJournalStore()
const keyboardStore = useKeyboardStore()
const teamStore = useTeamStore()
const passesStore = usePassesStore()
const eventsStore = useEventsStore()
const actionsStore = useActionsStore()

const handleGetFocus = () => {
  keyboardStore.forbidShortcuts()
}

const handleLosseFocus = () => {
  keyboardStore.allowShortcuts()
}

const saveFile = () => {
  const records = journalStore.sortedRecords
  const version = '2'
  const videoSrc = initStore.videoSrc
  const teamName_A = document.getElementById('teamName_A') as HTMLInputElement
  const teamName_B = document.getElementById('teamName_B') as HTMLInputElement

  const data = {
    version: version,
    videoSrc: videoSrc,
    playerModifierKey: keyboardStore.playerModifierKey,
    teams: [
      { name: teamName_A.value, id: teamStore.teams[0].id, players: teamStore.teams[0].players },
      { name: teamName_B.value, id: teamStore.teams[1].id, players: teamStore.teams[1].players },
    ],
    records: records,
    comments: records.filter((record) => record.type === JournalEntryType.COMMENT),
    events: eventsStore.events,
    passes: passesStore.passes,
    passesModifiers: passesStore.passesModifiers,
    positiveActions: actionsStore.positiveActions,
    negativeActions: actionsStore.negativeActions,
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
  let records: any[] = []
  const jsonDataIsObject = typeof jsonData === 'object' && jsonData !== null
  const hasVersionProperty = jsonDataIsObject && 'version' in jsonData

  if (hasVersionProperty) {
    records = Array.isArray(jsonData.records) ? jsonData.records : []
  } else {
    records = Array.isArray(jsonData) ? jsonData : []
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
    keyboardStore.setPlayerModifierKey(jsonData.playerModifierKey ?? 'NumpadEnter')

    if (Array.isArray(jsonData.teams)) {
      for (let index = 0; index < Math.min(jsonData.teams.length, 2); index++) {
        teamStore.setTeamNameAndID(index, jsonData.teams[index].name, jsonData.teams[index].id)

        const players: Array<Player> = []
        jsonData.teams[index].players?.forEach((playerData: any) => {
          const keyCode = playerData['key_code']
            ? normalizeShortcutKey(playerData['key_code'])
            : undefined
          const modifiers = (playerData['modifiers'] ?? []).map((modifier: string) =>
            modifier === 'NumpadEnter' ? keyboardStore.playerModifierKey : modifier,
          )
          players.push(
            createPlayer(playerData['id'], playerData['name'], keyCode, new Set(modifiers)),
          )
        })

        teamStore.setPlayersOfTeam(index, players)
      }
    }

    keyboardStore.removeKeyBindingsFor(playersSelectorShortcutManagerName)
    teamStore.players.forEach((player) => {
      if (player.key_code) {
        keyboardStore.addKeyBinding(player.key_code, playersSelectorShortcutManagerName)
      }
    })

    addRecords(jsonData, timOffset)
    if (Array.isArray(jsonData.comments)) {
      const loadedCommentIds = new Set(
        journalStore.sortedRecords
          .filter((record) => record.type === JournalEntryType.COMMENT)
          .map((record) => record.id),
      )
      jsonData.comments.forEach((comment: any) => {
        if (loadedCommentIds.has(comment.id)) return
        comment.ts += timOffset
        journalStore.addRecord(comment)
      })
    }

    initStore.videoSrc = jsonData.videoSrc || { uri: '', type: '' }
    if (Array.isArray(jsonData.events)) eventsStore.setEvents(jsonData.events)
    if (Array.isArray(jsonData.passes)) {
      passesStore.setPasses(jsonData.passes, jsonData.passesModifiers)
    }
    if (Array.isArray(jsonData.positiveActions) && Array.isArray(jsonData.negativeActions)) {
      actionsStore.setActions(jsonData.positiveActions, jsonData.negativeActions)
    }
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
  <input
    id="teamName_A"
    type="text"
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
    class="input-base input-medium"
    v-model="teamStore.teams[0].name"
  />
  VS
  <input
    id="teamName_B"
    v-model="teamStore.teams[1].name"
    type="text"
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
    class="input-base input-medium"
  />
  <sl-button @click="saveFile">Save File</sl-button>
  <sl-button @click="loadFile">Load File</sl-button>
</template>

<style scoped>
/* No component-specific styles needed - using global input-base and input-medium classes */
</style>
