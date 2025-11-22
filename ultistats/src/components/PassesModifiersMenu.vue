<script setup lang="ts">
import { usePassesStore } from '@/stores/passesStore'
import { storeToRefs } from 'pinia'
const passesStore = usePassesStore()
const { passesModifiers } = storeToRefs(passesStore)
import { useKeyboardStore } from '../stores/keyboardStore'
import { KeyboardConstants } from '@/types/keyConstants'
import type { passModifier } from '@/types/Passes'

const keyboardStore = useKeyboardStore()
const componentId = 'PassesModifiersMenu'
const logAction = (eventCode: string, modifiers: Set<string>) => {
  const modifier = passesStore.getModifierByKey(eventCode)
  if (modifier) passesStore.setModifierStatus(modifier, true)
}

const upKeyCallBack = (eventCode: string, modifiers: Set<string>) => {
  const modifier = passesStore.getModifierByKey(eventCode)
  if (modifier) passesStore.setModifierStatus(modifier, false)
}

const clickModifier = (modifier: passModifier) => {
  console.log('click modifier', modifier)
  passesStore.setModifierStatus(modifier, !modifier.isActive)
}

keyboardStore.addKeyBinding(componentId, KeyboardConstants.SHIFT, 'Shift for passes', logAction)
keyboardStore.addKeyBinding(componentId, KeyboardConstants.CTRL, 'Ctrl for passes', logAction)
keyboardStore.addKeyBindingUP(
  componentId,
  KeyboardConstants.SHIFT,
  'UP Shift for passes',
  upKeyCallBack,
)
keyboardStore.addKeyBindingUP(
  componentId,
  KeyboardConstants.CTRL,
  'UP Ctrl for passes',
  upKeyCallBack,
)
</script>
<template>
  <sl-button
    v-for="modifier in passesModifiers"
    :key="modifier.id"
    @click="clickModifier(modifier)"
    class="pass-modifier-button"
    :class="{ active: modifier.isActive }"
  >
    <span class="pass-modifier-name">{{ modifier.name }}</span>
    <span v-if="modifier.key"> [{{ modifier.key }}]</span>
  </sl-button>
</template>

<style scoped>
.pass-modifier-name {
  font-weight: bold;
  color: #00bcd4;
}
.pass-modifier-button {
  margin-left: 10px;
  padding: 2px 4px;
  min-width: 50px;
  max-width: 100px;
}

</style>
