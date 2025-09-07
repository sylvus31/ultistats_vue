<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalStore } from '@/stores/journal'
const tsRef = ref(0)
const lastEntryName = ref('?')
const journalStore = useJournalStore()

function setVideoTime(ts: number) {
  const lastEntry = journalStore.getLastEntryBeforeTs(ts) ?? null
  if (!lastEntry) return
  tsRef.value = ts - lastEntry?.ts
  lastEntryName.value = lastEntry.name
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
