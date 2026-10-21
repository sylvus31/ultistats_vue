<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import { usePassesStore } from '@/stores/passesStore'
import { useKeyboardStore } from '@/stores/keyboardStore'
import {
  formatShortcutKey,
  getKeyboardShortcutKey,
  normalizeShortcutKey,
} from '@/types/keyConstants'
import type { passModifier } from '@/types/Passes'
import {
  passesModifiersMenuSelectorShortcutManagerName,
  passesSelectorShortcutManagerName,
} from './interfaces/ShortcutTarget'

const passesStore = usePassesStore()
const { passes, passesModifiers } = storeToRefs(passesStore)
const keyboardStore = useKeyboardStore()

const synchronizePassBindings = () => {
  keyboardStore.removeKeyBindingsFor(passesSelectorShortcutManagerName)
  passes.value.forEach((pass) => {
    if (pass.key) {
      keyboardStore.addKeyBinding(pass.key, passesSelectorShortcutManagerName)
    }
  })
}

const handleKeyDown = (pass: (typeof passes.value)[number], event: KeyboardEvent) => {
  event.preventDefault()
  const key = getKeyboardShortcutKey(event)

  if (keyboardStore.isReservedShortcutKey(key)) {
    window.alert(`${formatShortcutKey(key)} is reserved for video controls.`)
    return
  }

  const assignedTarget = keyboardStore.getKeyBinding(key)
  if (assignedTarget && assignedTarget !== passesSelectorShortcutManagerName) {
    window.alert(`This key is already assigned to ${assignedTarget}. Please choose another key.`)
    return
  }

  const otherPass = passes.value.find(
    (candidate) => candidate.id !== pass.id && normalizeShortcutKey(candidate.key ?? '') === key,
  )
  if (otherPass) {
    window.alert(`This key is already assigned to ${otherPass.name}. Please choose another key.`)
    return
  }

  pass.key = key
  synchronizePassBindings()
}

const clearShortcut = (pass: (typeof passes.value)[number]) => {
  pass.key = ''
  synchronizePassBindings()
}

const handleModifierKeyDown = (modifier: passModifier, event: KeyboardEvent) => {
  event.preventDefault()
  const key = getKeyboardShortcutKey(event)

  if (keyboardStore.isReservedShortcutKey(key)) {
    window.alert(`${formatShortcutKey(key)} is reserved for video controls.`)
    return
  }

  const assignedTarget = keyboardStore.getKeyBinding(key)
  if (assignedTarget && assignedTarget !== passesModifiersMenuSelectorShortcutManagerName) {
    window.alert(`This key is already assigned to ${assignedTarget}. Please choose another key.`)
    return
  }

  const otherModifier = passesModifiers.value.find(
    (candidate) =>
      candidate.id !== modifier.id && normalizeShortcutKey(candidate.key ?? '') === key,
  )
  if (otherModifier) {
    window.alert(
      `This key is already assigned to ${otherModifier.name}. Please choose another key.`,
    )
    return
  }

  const passWithKey = passes.value.find((pass) => normalizeShortcutKey(pass.key ?? '') === key)
  if (passWithKey) {
    window.alert(`This key is already assigned to ${passWithKey.name}. Please choose another key.`)
    return
  }

  modifier.isActive = false
  modifier.key = key
}

const clearModifierShortcut = (modifier: passModifier) => {
  modifier.isActive = false
  modifier.key = ''
}

onMounted(() => {
  keyboardStore.forbidShortcuts()
  synchronizePassBindings()
})

onBeforeUnmount(() => {
  keyboardStore.allowShortcuts()
})
</script>

<template>
  <form>
    <section class="editor-section">
      <h3>Pass modifiers</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Shortcut</th>
            <th>Clear</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="modifier in passesModifiers" :key="modifier.id">
            <td>
              {{ modifier.name }}
            </td>
            <td>
              <sl-input
                :value="formatShortcutKey(modifier.key)"
                @keydown="handleModifierKeyDown(modifier, $event)"
                :aria-label="`${modifier.name} shortcut`"
              />
            </td>
            <td>
              <button
                type="button"
                class="clear-shortcut"
                :disabled="!modifier.key"
                :aria-label="`Clear ${modifier.name} shortcut`"
                @click="clearModifierShortcut(modifier)"
              >
                Clear
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="editor-section">
      <h3>Passes</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Shortcut</th>
            <th>Clear</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pass in passes" :key="pass.id">
            <td>
              <sl-input v-model="pass.name" />
            </td>
            <td>
              <sl-input
                :value="formatShortcutKey(pass.key)"
                @keydown="handleKeyDown(pass, $event)"
                :aria-label="`${pass.name} shortcut`"
              />
            </td>
            <td>
              <button
                type="button"
                class="clear-shortcut"
                :disabled="!pass.key"
                :aria-label="`Clear ${pass.name} shortcut`"
                @click="clearShortcut(pass)"
              >
                Clear
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.editor-section + .editor-section {
  margin-top: var(--spacing-lg);
}

h3 {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text-light);
  font-size: var(--font-size-md);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  min-width: 400px;
  color: var(--color-text-primary);
}

thead tr {
  background-color: var(--color-darker-bg);
  color: var(--color-text-light);
  text-align: left;
}

thead th {
  border-bottom: 2px solid var(--color-border);
}

th,
td {
  padding: var(--spacing-sm) var(--spacing-md);
}

tbody tr {
  border-bottom: 1px solid var(--color-border);
}

tbody tr:nth-of-type(even) {
  background-color: var(--color-darker-bg);
}

tbody tr:hover {
  background-color: var(--color-border);
}

.clear-shortcut {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.clear-shortcut:disabled {
  cursor: default;
  opacity: 0.5;
}
</style>
