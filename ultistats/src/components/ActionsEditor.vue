<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import { useActionsStore } from '@/stores/ActionsStore'
import { useKeyboardStore } from '@/stores/keyboardStore'
import type { Action } from '@/types/ActionsType'
import { ActionType } from '@/types/ActionsType'

const actionsStore = useActionsStore()
const keyboardStore = useKeyboardStore()
const { positiveActions, negativeActions } = storeToRefs(actionsStore)
let nextActionId = 1

const createActionDraft = (type: ActionType): Action => {
  let id = ''
  do {
    id = `new-${type}-${nextActionId++}`
  } while (
    positiveActions.value.some((action) => action.id === id) ||
    negativeActions.value.some((action) => action.id === id)
  )

  return { id, type, name: '', description: '', terminal: false }
}

const newPositiveAction = ref(createActionDraft(ActionType.POSITIVE))
const newNegativeAction = ref(createActionDraft(ActionType.NEGATIVE))
const editorPositiveActions = computed(() => [...positiveActions.value, newPositiveAction.value])
const editorNegativeActions = computed(() => [...negativeActions.value, newNegativeAction.value])

watch(
  () => newPositiveAction.value.name,
  async (name) => {
    if (!name.trim()) return
    positiveActions.value.push(newPositiveAction.value)
    newPositiveAction.value = createActionDraft(ActionType.POSITIVE)
    await nextTick()
  },
)

watch(
  () => newNegativeAction.value.name,
  async (name) => {
    if (!name.trim()) return
    negativeActions.value.push(newNegativeAction.value)
    newNegativeAction.value = createActionDraft(ActionType.NEGATIVE)
    await nextTick()
  },
)

const removeAction = (action: Action) => {
  const actions =
    action.type === ActionType.POSITIVE ? positiveActions.value : negativeActions.value
  const index = actions.findIndex((candidate) => candidate.id === action.id)
  if (index !== -1) actions.splice(index, 1)
}

onMounted(() => keyboardStore.forbidShortcuts())
onBeforeUnmount(() => keyboardStore.allowShortcuts())
</script>

<template>
  <form>
    <section class="editor-section">
      <h3>Positive actions</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Terminal</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in editorPositiveActions" :key="action.id">
            <td>
              <sl-input
                v-model="action.name"
                :aria-label="`${action.name} name`"
                :placeholder="action.id === newPositiveAction.id ? 'new...' : ''"
              />
            </td>
            <td>
              <textarea
                v-model="action.description"
                :aria-label="`${action.name} description`"
                rows="2"
              />
            </td>
            <td>
              <input
                v-model="action.terminal"
                type="checkbox"
                :aria-label="`${action.name} is terminal`"
              />
            </td>
            <td>
              <button
                v-if="!action.name.trim() && action.id !== newPositiveAction.id"
                type="button"
                class="remove-entry"
                aria-label="Remove empty positive action"
                title="Remove empty action"
                @click="removeAction(action)"
              >
                <span class="mdi mdi-delete-outline" aria-hidden="true"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="editor-section">
      <h3>Negative actions</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Terminal</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in editorNegativeActions" :key="action.id">
            <td>
              <sl-input
                v-model="action.name"
                :aria-label="`${action.name} name`"
                :placeholder="action.id === newNegativeAction.id ? 'new...' : ''"
              />
            </td>
            <td>
              <textarea
                v-model="action.description"
                :aria-label="`${action.name} description`"
                rows="2"
              />
            </td>
            <td>
              <input
                v-model="action.terminal"
                type="checkbox"
                :aria-label="`${action.name} is terminal`"
              />
            </td>
            <td>
              <button
                v-if="!action.name.trim() && action.id !== newNegativeAction.id"
                type="button"
                class="remove-entry"
                aria-label="Remove empty negative action"
                title="Remove empty action"
                @click="removeAction(action)"
              >
                <span class="mdi mdi-delete-outline" aria-hidden="true"></span>
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
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: var(--spacing-sm);
  text-align: left;
  vertical-align: middle;
}

textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 180px;
  resize: vertical;
  padding: var(--spacing-sm);
  color: var(--color-text-primary);
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}
</style>
