import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { journalPass, journalPlayer } from '@/types/journaltypes'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
type JournalEntry = journalPass | journalPlayer

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
  const journal = ref<JournalEntry[]>([])
  const addPlayerEntry = (name: string) => {
    const entry = { id: 'p1', name: name, ts: getTs() }
    journal.value.push(entry)
  }

  const addPassEntry = (name: string, modifiers: Set<string>) => {
    const entry = { id: 'a1', name: name, ts: getTs(), modifiers: modifiers }
    journal.value.push(entry)
  }

  return { journal, addPlayerEntry, addPassEntry, setVideoPlayerRef }
})
