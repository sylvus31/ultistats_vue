<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import { useEventsStore } from '@/stores/EventsStore'
import { useKeyboardStore } from '@/stores/keyboardStore'
import type { Event } from '@/types/EventsType'

const eventsStore = useEventsStore()
const keyboardStore = useKeyboardStore()
const { events } = storeToRefs(eventsStore)
let nextEventId = 1

const createEventDraft = (): Event => {
  let id = ''
  do {
    id = `new-event-${nextEventId++}`
  } while (events.value.some((event) => event.id === id))

  return { id, name: '', description: '' }
}

const newEvent = ref(createEventDraft())
const editorEvents = computed(() => [...events.value, newEvent.value])

watch(
  () => newEvent.value.name,
  () => {
    if (!newEvent.value.name.trim()) return
    events.value.push(newEvent.value)
    newEvent.value = createEventDraft()
  },
)

const removeEvent = (event: Event) => {
  const index = events.value.findIndex((candidate) => candidate.id === event.id)
  if (index !== -1) events.value.splice(index, 1)
}

onMounted(() => keyboardStore.forbidShortcuts())
onBeforeUnmount(() => keyboardStore.allowShortcuts())
</script>

<template>
  <form>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in editorEvents" :key="event.id">
          <td>
            <sl-input
              v-model="event.name"
              :aria-label="`${event.name} name`"
              :placeholder="event.id === newEvent.id ? 'new...' : ''"
            />
          </td>
          <td>
            <textarea
              v-model="event.description"
              :aria-label="`${event.name} description`"
              rows="2"
            />
          </td>
          <td>
            <button
              v-if="!event.name.trim() && event.id !== newEvent.id"
              type="button"
              class="remove-entry"
              aria-label="Remove empty event"
              title="Remove empty event"
              @click="removeEvent(event)"
            >
              <span class="mdi mdi-delete-outline" aria-hidden="true"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  min-width: 240px;
  resize: vertical;
  padding: var(--spacing-sm);
  color: var(--color-text-primary);
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}
</style>
