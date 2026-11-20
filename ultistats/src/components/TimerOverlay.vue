<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalStore, type JournalEntry } from '@/stores/journal'
import { JournalEntryType as jet } from '@/types/journaltypes'
import { useActionsStore } from '@/stores/ActionsStore'
import { useEventsStore } from '@/stores/EventsStore'
import { usePassesStore } from '@/stores/passesStore'
import { useTeamStore } from '@/stores/Team'
const tsRef = ref(0)
const lastEntryName = ref('?')
const journalStore = useJournalStore()
const actionsStore = useActionsStore()
const eventsStore = useEventsStore()
const passesStore = usePassesStore()
const teamStore = useTeamStore()

function getEntryName(entry: JournalEntry) {
  switch (entry.type) {
    case jet.PLAYER:
      return teamStore.getPlayerByID(entry.name)?.name ?? '?'
    case jet.POSITIVE_ACTION:
    case jet.NEGATIVE_ACTION:
      return actionsStore.getActionByID(entry.name)?.name ?? '?'
    case jet.PASS:
      return passesStore.getPassByID(entry.name)?.name ?? '?'
    case jet.EVENT:
      return eventsStore.getEventByID(entry.name)?.name ?? '?'
    case jet.COMMENT:
      return entry.name
    case jet.LINE:
      return 'Ligne'
    default:
      return '?'
  }
}

function setVideoTime(ts: number) {
  const lastEntry = journalStore.getLastEntryBeforeTs(ts) ?? null
  if (!lastEntry) {
    tsRef.value = 0
    lastEntryName.value = '?'
    return
  }
  tsRef.value = ts - lastEntry?.ts
  lastEntryName.value = getEntryName(lastEntry)
}

const timerClass = computed(() => {
  if (tsRef.value > 10) {
    return 'red'
  } else if (tsRef.value > 8) {
    return 'orange'
  } else {
    return ''
  }
})

defineExpose({
  setVideoTime: setVideoTime,
})
</script>

<template>
  <div class="timerOverlay" :class="timerClass">
    {{ lastEntryName }} : {{ (Math.floor(tsRef * 100) / 100).toFixed(2).padStart(5, '0') }}
  </div>
</template>

<style scoped>
.timerOverlay {
  background-color: rgba(50, 50, 50, 0.5);
  padding-left: 7px;
  padding-right: 7px;
  border-radius: 7px;
  border-color: aliceblue;
  border-width: 1px;
  border-style: solid;
}
.orange {
  color: orange;
}

.red {
  color: red;
}
</style>
