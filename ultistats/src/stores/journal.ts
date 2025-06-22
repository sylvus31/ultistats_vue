import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { journalPass, journalPlayer } from '@/types/journaltypes'
import { JournalEntryType as jet } from '@/types/journaltypes'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'

export type JournalEntry = journalPass | journalPlayer

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
    { id: '1', ts: 0, name: '1', type: jet.PASS, modifiers: new Set(['longue', 'break']) },
    { id: '2', ts: 2, name: '2', type: jet.PASS, modifiers: new Set(['longue']) },
    { id: '3', ts: 10, name: '10', type: jet.PASS, modifiers: new Set(['break']) },
    { id: '4', ts: 11, name: '11', type: jet.PASS, modifiers: new Set() },

    { id: '5', ts: 15, name: '15', type: jet.PLAYER },
    { id: '6', ts: 18, name: '18', type: jet.PLAYER },
    { id: '7', ts: 25, name: 'Joueur 2', type: jet.PLAYER },
    { id: '8', ts: 29, name: 'Joueur 1', type: jet.PLAYER },
    { id: '9', ts: 32, name: 'Joueur 4', type: jet.PLAYER },
    { id: '10', ts: 35, name: 'Joueur 3', type: jet.PLAYER },
    { id: '11', ts: 36, name: 'Joueur 2', type: jet.PLAYER },
  ])
  const addPlayerEntry = (name: string) => {
    const entry = { id: 'p1', name: name, ts: getTs(), type: jet.PLAYER }
    records.value.push(entry)
  }

  const addPassEntry = (name: string, modifiers: Set<string>) => {
    const entry = { id: 'a1', name: name, ts: getTs(), modifiers: modifiers, type: jet.PASS }
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

  const deleteRecord = (entry: JournalEntry) => {
    const index = records.value.indexOf(entry)
    if (index !== -1) {
      records.value.splice(index, 1)
    }
  }

  return { records, addPlayerEntry, addPassEntry, setVideoPlayerRef, toggleModifier, deleteRecord }
})
