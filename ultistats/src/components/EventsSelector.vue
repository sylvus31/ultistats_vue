<script setup lang="ts">
import { useEventsStore } from '@/stores/EventsStore'
import { useJournalStore } from '@/stores/journal'

const eventsStore = useEventsStore()
const journalStore = useJournalStore()
</script>
<template>
  <div class="buttons">
    <sl-button
      v-for="action in eventsStore.events"
      :key="action.id"
      @click="journalStore.addEventEntry(action.id)"
    >
      <span class="pass-name">{{ action.name }}</span>
    </sl-button>
  </div>
</template>
<style scoped>
sl-button::part(base) {
  justify-content: center;
  width: 150px;
}

.buttons {
  display: flexbox;
  flex-wrap: wrap;
}
</style>
