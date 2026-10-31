<script setup lang="ts">
import { usePassesStore } from '@/stores/passesStore'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useKeyboardStore } from '../stores/keyboardStore'
import { formatShortcutKey, normalizeShortcutKey } from '@/types/keyConstants'
import type { passModifier } from '@/types/Passes'
import { passesModifiersMenuSelectorShortcutManagerName } from './interfaces/ShortcutTarget'
import { getDescriptionTooltip } from '@/types/descriptions'

const passesStore = usePassesStore()
const { passesModifiers } = storeToRefs(passesStore)
const keyboardStore = useKeyboardStore()
const componentId = 'PassesModifiersMenu'
const registeredModifierKeys = new Set<string>()

const logAction = (eventCode: string, modifiers: Set<string>) => {
  const modifier = passesStore.getModifierByKey(eventCode)
  if (modifier) passesStore.setModifierStatus(modifier, true)
}

const upKeyCallBack = (eventCode: string, modifiers: Set<string>) => {
  const modifier = passesStore.getModifierByKey(eventCode)
  if (modifier) passesStore.setModifierStatus(modifier, false)
}

const synchronizeModifierBindings = () => {
  registeredModifierKeys.forEach((key) => {
    keyboardStore.removeKeyBinding(key)
    keyboardStore.removeKeyBindingUP(key)
  })
  registeredModifierKeys.clear()

  passesModifiers.value.forEach((modifier) => {
    if (!modifier.key) return

    const key = normalizeShortcutKey(modifier.key)
    if (keyboardStore.addKeyBinding(key, passesModifiersMenuSelectorShortcutManagerName)) {
      keyboardStore.addKeyBindingUP(componentId, key, `UP ${key} for passes`, upKeyCallBack)
      registeredModifierKeys.add(key)
    }
  })
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

watch(() => passesModifiers.value.map((modifier) => modifier.key), synchronizeModifierBindings, {
  immediate: true,
})
</script>
<template>
  <sl-button
    v-for="modifier in passesModifiers"
    :key="modifier.id"
    @click="clickModifier(modifier)"
    class="pass-modifier-button"
    :class="{ active: modifier.isActive }"
    :title="getDescriptionTooltip(modifier.description)"
  >
    <span class="pass-modifier-name">{{ modifier.name }}</span>
    <span v-if="modifier.key"> [{{ formatShortcutKey(modifier.key) }}]</span>
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
