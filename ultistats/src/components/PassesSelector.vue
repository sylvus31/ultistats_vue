<template>
  <div class="buttons">
    <sl-button
      v-for="action in passes"
      :key="action.id"
      @click="clickAction(action)"
      :class="{ active: action.isActive }"
    >
      <span class="pass-name">{{ action.name }}</span>
      <span v-if="action.legend"> [{{ action.legend }}]</span>
    </sl-button>
  </div>
</template>

<script setup lang="ts">
import { usePassesStore } from '@/stores/passesStore'
import { storeToRefs } from 'pinia'
import type { Pass } from '@/types/Passes'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { useKeyboardStore } from '../stores/keyboardStore'

const keyboardStore = useKeyboardStore()

const passesStore = usePassesStore()
const { passes } = storeToRefs(passesStore)
const componentId = 'PassesSelector'

const clickAction = (pass: Pass) => {
  console.log(pass.name)
  passesStore.selectActivePass(pass.id)
}

const logAction = (eventCode: string, modifiers: Set<string>) => {
  console.log(eventCode, modifiers)
  const action = passesStore.getActionByKey(eventCode)
  if (action) passesStore.selectActivePass(action.id)
}

passes.value.forEach((p) => {
  if (p.key) {
    console.log('binding', p.name, p.key)
    keyboardStore.addKeyBinding(componentId, p.key, 'action: ' + p.name, logAction)
  }
})
</script>

<style scoped>
.pass-name {
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
