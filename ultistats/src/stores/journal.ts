import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { journalPass, journalPlayer, journalAction } from '@/types/journaltypes'
import { JournalEntryType as jet } from '@/types/journaltypes'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'

export type JournalEntry = journalPass | journalPlayer

let idIndex = 0

const getNextIdIndex = () => {
  return idIndex++
}

const videoPlayerRef = ref<VideoPlayerInstance | null>(null)
const setVideoPlayerRef = (ref: Ref<VideoPlayerInstance | null>) => {
  videoPlayerRef.value = ref.value
}

function getTs() {
  let ts = 0
  if (videoPlayerRef.value) {
    ts = videoPlayerRef.value.elapsedTimeValue
  }
  return ts
}

export const useJournalStore = defineStore('journal', () => {
  const records = ref<JournalEntry[]>([
    {
      id: getNextIdIndex(),
      ts: 0,
      name: '0',
      type: jet.PASS,
      modifiers: new Set(['longue', 'break']),
    },
    { id: getNextIdIndex(), ts: 2, name: '2', type: jet.PASS, modifiers: new Set(['longue']) },
    {
      id: getNextIdIndex(),
      ts: 10,
      name: '10',
      type: jet.PASS,
      modifiers: new Set(['break']),
    },
    { id: getNextIdIndex(), ts: 11, name: '11', type: jet.PASS, modifiers: new Set() },

    { id: getNextIdIndex(), ts: 15, name: '15', type: jet.PLAYER },
    { id: getNextIdIndex(), ts: 18, name: '18', type: jet.PLAYER },
    { id: getNextIdIndex(), ts: 25, name: 'Joueur 2', type: jet.PLAYER },
    { id: getNextIdIndex(), ts: 29, name: 'Joueur 1', type: jet.PLAYER },
    { id: getNextIdIndex(), ts: 32, name: 'Joueur 4', type: jet.PLAYER },
    { id: getNextIdIndex(), ts: 35, name: 'Joueur 3', type: jet.PLAYER },
    { id: getNextIdIndex(), ts: 36, name: 'Joueur 2', type: jet.PLAYER },
  ])
  const addPlayerEntry = (name: string) => {
    const entry = { id: getNextIdIndex(), name: name, ts: getTs(), type: jet.PLAYER }
    records.value.push(entry)
  }

  const addPassEntry = (name: string, modifiers: Set<string>) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      modifiers: modifiers,
      type: jet.PASS,
    }
    records.value.push(entry)
  }

  const addActionEntry = (name: string, terminal: boolean, positive: boolean) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      terminal: terminal,
      type: positive ? jet.POSITIVE_ACTION : jet.NEGATIVE_ACTION,
    }
    records.value.push(entry)
  }

  const toggleModifier = (entry: JournalEntry, modifier: string) => {
    if (!entry.hasOwnProperty('modifiers')) return
    if (entry.modifiers.has(modifier)) {
      entry.modifiers.delete(modifier)
    } else {
      entry.modifiers.add(modifier)
    }
  }

  const addEventEntry = (name: string) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      type: jet.EVENT,
    }
    records.value.push(entry)
  }

  const deleteRecord = (entry: JournalEntry) => {
    const index = records.value.indexOf(entry)
    if (index !== -1) {
      records.value.splice(index, 1)
    }
  }

  return {
    records,
    addPlayerEntry,
    addPassEntry,
    setVideoPlayerRef,
    toggleModifier,
    deleteRecord,
    addActionEntry,
    addEventEntry,
  }
})
