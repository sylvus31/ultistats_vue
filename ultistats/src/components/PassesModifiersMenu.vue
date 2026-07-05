<script setup lang="ts">
import { usePassesStore } from '@/stores/passesStore'
import { storeToRefs } from 'pinia'
const passesStore = usePassesStore()
const { passesModifiers } = storeToRefs(passesStore)
import { useKeyboardStore } from '../stores/keyboardStore'
import { KeyboardConstants } from '@/types/keyConstants'
import type { passModifier } from '@/types/Passes'
import { passesModifiersMenuSelectorShortcutManagerName } from './interfaces/ShortcutTarget'

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

const passesModifiersMenuSelectorShortcutManager: ShortcutTarget = {
  message() {
    const action = passesStore.getActionByKey(eventCode)

    return 'action: ' + (action ? action.name : 'unknown')
  },

  callback(eventCode: string, activeModifiers: Set<string>) {
    logAction(eventCode, activeModifiers)
  },

  setShortcut(eventCode: string) {
    console.log('set shortcut', eventCode)
  },

  removeShortcut(eventCode: string, activeModifiers: Set<string>) {
    console.log('remove shortcut', eventCode, activeModifiers)
  },
}
keyboardStore.registerShortcutTarget(
  passesModifiersMenuSelectorShortcutManagerName,
  passesModifiersMenuSelectorShortcutManager,
)
keyboardStore.addKeyBinding(KeyboardConstants.SHIFT, passesModifiersMenuSelectorShortcutManagerName)
keyboardStore.addKeyBinding(KeyboardConstants.CTRL, passesModifiersMenuSelectorShortcutManagerName)
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
