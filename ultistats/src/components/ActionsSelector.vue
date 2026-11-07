<script setup lang="ts">
import { computed } from 'vue'
import { useActionsStore } from '@/stores/ActionsStore'
import { useJournalStore } from '@/stores/journal'
import { getDescriptionTooltip } from '@/types/descriptions'

const props = withDefaults(defineProps<{ coreOnly?: boolean }>(), { coreOnly: false })
const journalStore = useJournalStore()
const actionsStore = useActionsStore()
const visiblePositiveActions = computed(() =>
  actionsStore.positiveActions.filter((action) =>
    props.coreOnly ? action.core === true : action.core !== true,
  ),
)
const visibleNegativeActions = computed(() =>
  actionsStore.negativeActions.filter((action) =>
    props.coreOnly ? action.core === true : action.core !== true,
  ),
)
</script>
<template>
  <div class="buttons" :class="{ 'core-actions': props.coreOnly }">
    <sl-button
      v-for="action in visiblePositiveActions"
      :key="action.id"
      :class="{ positiveButton: true }"
      :title="getDescriptionTooltip(action.description)"
      @click="journalStore.addActionEntry(action.id, true)"
    >
      <span class="pass-name">{{ action.name }}</span>
    </sl-button>
    <sl-button
      v-for="action in visibleNegativeActions"
      :key="action.id"
      :class="{ negativeButton: true }"
      :title="getDescriptionTooltip(action.description)"
      @click="journalStore.addActionEntry(action.id, false)"
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
  display: flex;
  flex-wrap: wrap;
}

.core-actions {
  flex-wrap: nowrap;
  gap: var(--spacing-xs);
}

</style>
