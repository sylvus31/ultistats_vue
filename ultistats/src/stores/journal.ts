import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { journalPass, journalPlayer, journalAction, journalLine } from '@/types/journaltypes'
import { JournalEntryType as jet } from '@/types/journaltypes'
import { JournalEntrySource as src } from '@/types/journaltypes'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'

export type JournalEntry = journalPass | journalPlayer | journalAction | journalLine

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
      source: src.USER,
    },
    {
      id: getNextIdIndex(),
      ts: 2,
      name: '2',
      type: jet.PASS,
      modifiers: new Set(['longue']),
      source: src.AI,
    },
    {
      id: getNextIdIndex(),
      ts: 10,
      name: '10',
      type: jet.PASS,
      modifiers: new Set(['break']),
      source: src.USER,
    },
    {
      id: getNextIdIndex(),
      ts: 11,
      name: '11',
      type: jet.PASS,
      modifiers: new Set(),
      source: src.USER,
    },

    { id: getNextIdIndex(), ts: 15, name: '15', type: jet.PLAYER, source: src.AI },
    { id: getNextIdIndex(), ts: 18, name: '18', type: jet.PLAYER, source: src.USER },
    { id: getNextIdIndex(), ts: 25, name: 'Joueur 2', type: jet.PLAYER, source: src.USER },
    { id: getNextIdIndex(), ts: 29, name: 'Joueur 1', type: jet.PLAYER, source: src.USER },
    { id: getNextIdIndex(), ts: 32, name: 'Joueur 4', type: jet.PLAYER, source: src.USER },
    { id: getNextIdIndex(), ts: 35, name: 'Joueur 3', type: jet.PLAYER, source: src.USER },
    { id: getNextIdIndex(), ts: 36, name: 'Joueur 2', type: jet.PLAYER, source: src.USER },
  ])

  records.value = []
  const addPlayerEntry = (name: string) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      type: jet.PLAYER,
      source: src.USER,
    }
    addEntry(entry)
  }

  const addPassEntry = (name: string, modifiers: Set<string>) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      modifiers: modifiers,
      type: jet.PASS,
      source: src.USER,
    }
    addEntry(entry)
  }

  const addActionEntry = (name: string, terminal: boolean, positive: boolean) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      terminal: terminal,
      type: positive ? jet.POSITIVE_ACTION : jet.NEGATIVE_ACTION,
      source: src.USER,
    }
    addEntry(entry)
  }
  const urlParams = new URLSearchParams(window.location.search)
  const ai = urlParams.get('ai')

  const getPrecedentEntryByTypes = (
    entry: JournalEntry,
    types: Array<jet>,
  ): JournalEntry | null => {
    const precedentEntries = records.value
      .filter((e) => e.ts < entry.ts)
      .filter((e) => types.includes(e.type))
      .sort((a, b) => (a.ts === b.ts ? a.id - b.id : a.ts - b.ts))
    const precedentEntry = precedentEntries[precedentEntries.length - 1] || null
    if (precedentEntry == entry) return null
    return precedentEntry
  }

  const addAiEntry = (entry: JournalEntry) => {
    const lastMeaningFulEntry = getPrecedentEntryByTypes(entry, [jet.PLAYER, jet.PASS, jet.EVENT])
    console.log('last mean entry', lastMeaningFulEntry)
    if (!lastMeaningFulEntry || ai) return

    const intervalEntries = records.value
      .filter((e) => e.ts > lastMeaningFulEntry.ts)
      .filter((e) => e.ts < entry.ts)
    let isBlocker = false
    intervalEntries.forEach((e) => {
      if (e.type === jet.EVENT || ['score'].includes(e.name)) {
        isBlocker = true
      }
    })
    if (isBlocker) return

    const ts = (entry.ts + getPrecedentEntryByTypes(entry, Object.values(jet))!.ts) / 2
    // player to player
    if (lastMeaningFulEntry.type === jet.PLAYER && entry.type === jet.PLAYER) {
      const aiEntry = {
        id: getNextIdIndex(),
        name: 'Passe',
        ts: ts,
        modifiers: new Set([]),
        type: jet.PASS,
        source: src.AI,
      }
      records.value.push(aiEntry)
    }

    // pass to pass
    if (lastMeaningFulEntry.type === jet.PASS && entry.type === jet.PASS) {
      const lastPlayer = getPrecedentEntryByTypes(entry, [jet.PLAYER])
      if (lastPlayer) {
        const name = lastPlayer.name == 'ADVERSAIRE' ? 'ADVERSAIRE' : 'BTR'
        const aiEntry = {
          id: getNextIdIndex(),
          name: name,
          ts: ts,
          type: jet.PLAYER,
          source: src.AI,
        }
        records.value.push(aiEntry)
      }
    }
  }

  const addEntry = (entry: JournalEntry) => {
    addAiEntry(entry)
    records.value.push(entry)
  }

  const toggleModifier = (entry: JournalEntry, modifier: string) => {
    if ('modifiers' in entry) {
      if (entry.modifiers.has(modifier)) {
        entry.modifiers.delete(modifier)
      } else {
        entry.modifiers.add(modifier)
      }
    }
  }

  const addLineEntry = (players: Set<string>) => {
    const entry = {
      id: getNextIdIndex(),
      name: 'Line',
      ts: getTs(),
      type: jet.LINE,
      players: players,
      source: src.USER,
    }
    addEntry(entry)
  }

  const addEventEntry = (name: string) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      type: jet.EVENT,
      source: src.USER,
    }
    addEntry(entry)
  }

  const deleteRecord = (entry: JournalEntry) => {
    const index = records.value.indexOf(entry)
    if (index !== -1) {
      records.value.splice(index, 1)
    }
  }

  const updateTime = (entry: JournalEntry) => {
    entry.ts = getTs()
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
    addLineEntry,
    updateTime,
  }
})
