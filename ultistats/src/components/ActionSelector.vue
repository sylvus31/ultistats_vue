<template>
  <div class="buttons">
    <sl-button
      v-for="action in actions"
      :key="action.id"
      @click="selectAction(action)"
      :class="{ active: action.isActive }"
    >
      <span class="player-name">{{ action.name }}</span>
      <span v-if="action.key"> [{{ action.key }}]</span>
    </sl-button>
  </div>
</template>

<script setup lang="ts">
import { useActionStore } from '@/stores/actionsStore'
import { storeToRefs } from 'pinia'
import type { Action } from '@/types/Action'
import '@shoelace-style/shoelace/dist/components/button/button.js'

const actionStore = useActionStore()
const { actions } = storeToRefs(actionStore)

const selectAction = (action: Action) => {
  actionStore.selectActiveAction(action.id)
}
</script>

<style scoped>
.player-name {
  font-weight: bold;
  color: #00bcd4;
}
sl-button::part(base) {
  justify-content: center;
  width: 150px;
}
.buttons {
  display: flexbox;
  flex-wrap: wrap;
}
</style>
