<script setup lang="ts">
import { useActionsStore } from '@/stores/ActionsStore'
import { useJournalStore } from '@/stores/journal'

const journalStore = useJournalStore()
const actionsStore = useActionsStore()
</script>
<template>
  <div class="buttons">
    <sl-button
      v-for="action in actionsStore.positiveActions"
      :key="action.id"
      :class="{ positiveButton: true }"
      @click="journalStore.addActionEntry(action.name, action.terminal, true)"
    >
      <span class="pass-name">{{ action.name }}</span>
    </sl-button>
    <sl-button
      v-for="action in actionsStore.negativeActions"
      :key="action.id"
      :class="{ negativeButton: true }"
      @click="journalStore.addActionEntry(action.name, action.terminal, false)"
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

sl-button.positiveButton::part(base) {
  border: 2px solid #035812ac;
  color: #089421ac;
}

sl-button.negativeButton::part(base) {
  border: 2px solid #8b0a1a;
  color: #b05959;
}

.buttons {
  display: flexbox;
  flex-wrap: wrap;
}
</style>
