<script setup lang="ts">
import { computed, onUpdated, ref, type Ref } from 'vue'

import {
  JournalEntryType as jet,
  JournalEntryType,
  JournalEntrySource as src,
} from '@/types/journaltypes'
import type { JournalEntry } from '@/stores/journal'
import { useJournalStore } from '@/stores/journal'
import { useActionsStore } from '@/stores/ActionsStore'
import { useTeamStore } from '@/stores/Team'
import { usePassesStore } from '@/stores/passesStore'
import { useEventsStore } from '@/stores/EventsStore'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'

const videoPlayerRef = ref<VideoPlayerInstance | null>(null)
const setVideoPlayerRef = (ref: Ref<VideoPlayerInstance | null>) => {
  videoPlayerRef.value = ref.value
}
const journalStore = useJournalStore()
const journalRecords = journalStore.records
const teamStore = useTeamStore()
const actionsStore = useActionsStore()
const passesStore = usePassesStore()
const eventsStore = useEventsStore()
const journalEventsToShow = computed(() => {
  if (!videoPlayerRef.value) return journalRecords
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
  displayButtonStyle(`delete-button-${record.id}`, 'none')
}

function onClickView(record: JournalEntry) {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.goTo(record.ts - 2)
  }
}
function onClickTimer(record: JournalEntry) {
  journalStore.updateTime(record)
  record.source = src.USER
}

const displayButtonStyle = (buttonId: string, displayStyle: string) => {
  const button = document.getElementById(buttonId)
  if (button) button.style.display = displayStyle
}

function onClickLongue(record: JournalEntry) {
  journalStore.toggleModifier(record, 'longue')
  record.source = src.USER
}

function onClickBreak(record: JournalEntry) {
  journalStore.toggleModifier(record, 'break')
  record.source = src.USER
}

function onClickDelete(record: JournalEntry) {
  journalStore.deleteRecord(record)
}

function onClickAi(record: JournalEntry) {
  record.source = src.USER
}

function getAlternatives(type: JournalEntryType) {
  let alternatives
  switch (type) {
    case jet.PASS:
      alternatives = passesStore.passes
      break
    case jet.POSITIVE_ACTION:
      alternatives = actionsStore.positiveActions
      break
    case jet.NEGATIVE_ACTION:
      alternatives = actionsStore.negativeActions
      break
    case jet.EVENT:
      alternatives = eventsStore.events
      break
    case jet.PLAYER:
      alternatives = teamStore.players
  }
  return alternatives?.map((a) => a.name) ?? []
}
function onClickSwap(record: JournalEntry, event: MouseEvent) {
  const propositions = ['Choisir'].concat(getAlternatives(record.type))
  const selectDialog = document.createElement('dialog')
  const { clientX, clientY } = event as MouseEvent
  selectDialog.style.position = 'absolute'
  selectDialog.style.left = `${clientX}px`
  selectDialog.style.top = `${clientY}px`

  selectDialog.innerHTML = `
    <h2>${record.type}</h2>
    <select>
      ${propositions.map((p) => `<option>${p}</option>`).join('')}
    </select>
  `
  document.body.appendChild(selectDialog)
  selectDialog.showModal()
  const select = selectDialog.querySelector('select')
  select!.addEventListener('change', (e) => {
    const selectedValue = (e.target as HTMLSelectElement).value
    record.name = selectedValue
    record.source = src.USER
    selectDialog.close()
  })
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
        @mouseleave="onHoverOut(record)"
        @click="displayButtonStyle(`delete-button-${record.id}`, 'inline-block')"
        title="Cliquer pour supprimer l'action"
      >
        <span
          v-if="videoPlayerRef"
          class="mdi mdi-play-circle-outline"
          @click="onClickView(record)"
          title="Revoir l'action. Cliquer pour la modifier."
        ></span>
        <span
          :id="`delete-button-${record.id}`"
          class="mdi mdi-delete-outline"
          @click.stop="onClickDelete(record)"
          style="display: none"
          title="Supprimer l'action"
        ></span>
        {{ record.name }}
        <span v-if="record.type === jet.PASS && 'modifiers' in record"
          ><button
            class="pass-button"
            :class="{ active: record.modifiers.has('longue') }"
            @click.stop="onClickLongue(record)"
          >
            L
          </button>
          <button
            class="pass-button"
            :class="{ active: record.modifiers.has('break') }"
            @click.stop="onClickBreak(record)"
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
          @click.stop="onClickAi(record)"
          title="Accepter l'action"
        ></span>
        <span
          class="mdi mdi-timer-outline"
          :id="`timer-button-${record.id}`"
          @click.stop="onClickTimer(record)"
          title="Change le moment de l'action"
        ></span>
        <span
          class="mdi mdi-swap-vertical"
          @click.stop="(e) => onClickSwap(record, e)"
          title="Modifier l'action"
        ></span>
      </sl-button>
    </div>
  </div>
</template>

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
