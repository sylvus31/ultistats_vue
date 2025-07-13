<template>
  <div class="journal-viewer">
    <div class="button-container" ref="buttonContainer">
      <sl-button
        v-for="(record, index) in journalEventsToShow"
        :key="index"
        :style="{ marginLeft: index === 0 ? 0 : '10px', whiteSpace: 'nowrap' }"
        :class="{
          active: record.ts <= (videoPlayerRef?.elapsedTimeValue ?? 0),
          ai: record.source === src.AI,
        }"
        @click="onClickButton(record)"
        @mouseleave="onHoverOut(record)"
      >
        <span
          :id="`delete-button-${record.id}`"
          class="mdi mdi-delete-outline"
          @click.stop="onClickDelete(record)"
          style="display: none"
        ></span>
        {{ record.name }}
        <span v-if="record.type === jet.PASS && 'modifiers' in record"
          ><button
            class="pass-button"
            :class="{ active: record.modifiers.has('longue') }"
            @click="onClickLongue(record)"
          >
            L
          </button>
          <button
            class="pass-button"
            :class="{ active: record.modifiers.has('break') }"
            @click="onClickBreak(record)"
          >
            B
          </button></span
        >
        <span
          v-if="record.type === jet.LINE && 'players' in record"
          :title="Array.from(record.players).join(', ')"
        >
          ({{ record.players.size }})
        </span>
        <span
          v-if="record.source === src.AI"
          class="mdi mdi-robot-outline"
          @click="onClickAi(record)"
        ></span>
      </sl-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onUpdated, ref, type Ref } from 'vue'

import { JournalEntryType as jet, JournalEntrySource as src } from '@/types/journaltypes'
import type { JournalEntry } from '@/stores/journal'
import { useJournalStore } from '@/stores/journal'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'

const videoPlayerRef = ref<VideoPlayerInstance | null>(null)
const setVideoPlayerRef = (ref: Ref<VideoPlayerInstance | null>) => {
  videoPlayerRef.value = ref.value
}
const journalStore = useJournalStore()
const journalRecords = journalStore.records
const journalEventsToShow = computed(() => {
  if (!videoPlayerRef.value) return []
  const ts = videoPlayerRef.value.elapsedTimeValue

  const events = [...journalRecords].sort((a, b) => a.ts - b.ts)
  const start = Math.max(
    ...journalRecords.filter((p) => p.ts < ts && p.name === 'score').map((p) => p.ts),
  )
  const end = Math.min(
    ...journalRecords.filter((p) => p.ts >= ts && p.name === 'score').map((p) => p.ts),
  )

  return events.filter((p) => p.ts > start && p.ts <= end)
})
function onHoverOut(record: JournalEntry) {
  const deleteButton = document.getElementById(`delete-button-${record.id}`)
  if (deleteButton) {
    deleteButton.style.display = 'none'
  }
}

function onClickButton(record: JournalEntry) {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.goTo(record.ts - 2)
  }

  const deleteButton = document.getElementById(`delete-button-${record.id}`)
  if (deleteButton) {
    deleteButton.style.display = 'inline-block'
  }
}

function onClickLongue(record: JournalEntry) {
  journalStore.toggleModifier(record, 'longue')
}

function onClickBreak(record: JournalEntry) {
  journalStore.toggleModifier(record, 'break')
}

function onClickDelete(record: JournalEntry) {
  journalStore.deleteRecord(record)
}

function onClickAi(record: JournalEntry) {
  record.source = src.USER
}

function scrollToLastActiveButtons() {
  const buttonContainer = document.querySelector('.button-container')
  if (!buttonContainer) return

  const activeButtons = Array.from(buttonContainer.querySelectorAll('sl-button.active'))
  if (activeButtons.length > 0) {
    const lastTwoActiveButtons = activeButtons.slice(-2)
    const button = lastTwoActiveButtons[0] as HTMLButtonElement
    const scrollLeft = button.offsetLeft

    buttonContainer.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    })
  }
}

onUpdated(() => {
  const buttonContainer = document.querySelector('.button-container')
  if (buttonContainer) {
    scrollToLastActiveButtons()
  }
})

defineExpose({
  setVideoPlayerRef,
})
</script>
<style scoped>
.journal-viewer {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.button-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 10px;
}

sl-button.ai::part(base) {
  background-color: #686b54;
  color: #fff; /* White text for active */
}

.slider-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.slider-container input[type='range'] {
  width: 100%;
}
.pass-button {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  border: none;
  margin: 0 0.25em;
}
.pass-button.active {
  font-weight: bold;
  color: #00bcd4;
}
</style>
