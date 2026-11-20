import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import type {
  journalPass,
  journalPlayer,
  journalAction,
  journalLine,
  journalComment,
  journalEvent,
} from '@/types/journaltypes'
import { JournalEntryType as jet } from '@/types/journaltypes'
import { JournalEntrySource as src } from '@/types/journaltypes'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
import { separateRecordsInPoints } from './pointsStore'
import { useTeamStore } from './Team'
import { useActionsStore } from './ActionsStore'
import { isActionRecord, isScoreActionRecord } from '@/types/scoreAction'
import { ACTION_IDS } from '@/types/catalogIds'

export type JournalEntry =
  | journalPass
  | journalPlayer
  | journalAction
  | journalLine
  | journalComment
  | journalEvent

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
  const records = ref<JournalEntry[]>([])
  const hasUnsavedChanges = ref(false)
  const sortedRecords = computed(() => records.value.sort((a, b) => a.ts - b.ts))
  const recordsAsPoints = computed(() => {
    return separateRecordsInPoints(sortedRecords.value)
  })

  const markSaved = () => {
    hasUnsavedChanges.value = false
  }

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

  const addActionEntry = (name: string, positive: boolean) => {
    const entry = {
      id: getNextIdIndex(),
      name: name,
      ts: getTs(),
      type: positive ? jet.POSITIVE_ACTION : jet.NEGATIVE_ACTION,
      source: src.USER,
    }
    addEntry(entry)
  }

  const addCommentEntry = (title: string, details: string) => {
    const entry = {
      id: getNextIdIndex(),
      name: title,
      ts: getTs(),
      type: jet.COMMENT,
      source: src.USER,
      details: details,
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
      if (
        e.type === jet.EVENT ||
        isScoreActionRecord(e) ||
        isActionRecord(e, ACTION_IDS.PULL) ||
        isActionRecord(e, ACTION_IDS.BLOCK)
      ) {
        isBlocker = true
      }
    })
    if (isBlocker) return

    const ts = (entry.ts + getPrecedentEntryByTypes(entry, Object.values(jet))!.ts) / 2
    // player to player
    if (lastMeaningFulEntry.type === jet.PLAYER && entry.type === jet.PLAYER) {
      const aiEntry = {
        id: getNextIdIndex(),
        name: 'a0',
        ts: ts,
        modifiers: new Set([]),
        type: jet.PASS,
        source: src.AI,
      }
      records.value.push(aiEntry)
    }

    // pass to pass
    if (lastMeaningFulEntry.type === jet.PASS && entry.type === jet.PASS) {
      const lastPlayerEntry = getPrecedentEntryByTypes(entry, [jet.PLAYER])
      if (lastPlayerEntry) {
        // if called at top, generate error because pinia is not initialised yet
        const teamStore = useTeamStore()

        const player = teamStore.getPlayerByID(lastPlayerEntry.name)!
        const teamIndex = teamStore.getPlayerTeam(player)
        const name = teamStore.teams[teamIndex].id
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
    hasUnsavedChanges.value = true
  }

  const toggleModifier = (entry: JournalEntry, modifier: string) => {
    if ('modifiers' in entry) {
      if (entry.modifiers.has(modifier)) {
        entry.modifiers.delete(modifier)
      } else {
        entry.modifiers.add(modifier)
      }
      hasUnsavedChanges.value = true
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
      hasUnsavedChanges.value = true
    }
  }

  const deleteAllRecords = () => {
    if (records.value.length > 0) {
      hasUnsavedChanges.value = true
    }
    records.value.splice(0)
  }

  const updateTime = (entry: JournalEntry) => {
    entry.ts = getTs()
    hasUnsavedChanges.value = true
  }

  const addRecord = (record: JournalEntry) => {
    records.value.push(record)
    hasUnsavedChanges.value = true
    if (record.id >= idIndex) {
      idIndex = record.id + 1
    }
  }

  const getLastEntryBeforeTs = (ts: number) => {
    return [...sortedRecords.value].reverse().find((record) => record.ts < ts) ?? null
  }

  return {
    sortedRecords,
    recordsAsPoints,
    hasUnsavedChanges,
    markSaved,
    deleteAllRecords,
    addRecord,
    addPlayerEntry,
    addPassEntry,
    setVideoPlayerRef,
    toggleModifier,
    deleteRecord,
    addActionEntry,
    addEventEntry,
    addLineEntry,
    addCommentEntry,
    updateTime,
    getLastEntryBeforeTs,
  }
})
