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

  return { id, name: '', description: '', core: false }
}

const newEvent = ref(createEventDraft())
const coreEvents = computed(() => events.value.filter((event) => event.core === true))
const nonCoreEvents = computed(() => [
  ...events.value.filter((event) => event.core !== true),
  newEvent.value,
])

watch(
  () => newEvent.value.name,
  () => {
    if (!newEvent.value.name.trim()) return
    events.value.push(newEvent.value)
    newEvent.value = createEventDraft()
  },
)

const removeEvent = (event: Event) => {
  if (event.core) return
  const index = events.value.findIndex((candidate) => candidate.id === event.id)
  if (index !== -1) events.value.splice(index, 1)
}

const clearEvent = (event: Event) => {
  if (event.core) return
  event.name = ''
  event.description = ''
}

onMounted(() => keyboardStore.forbidShortcuts())
onBeforeUnmount(() => keyboardStore.allowShortcuts())
</script>

<template>
  <form>
    <section class="editor-section core-events">
      <h3>Core events</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in coreEvents" :key="event.id">
            <td>
              <sl-input v-model="event.name" :aria-label="`${event.name} name`" />
            </td>
            <td>
              <textarea
                :value="event.description"
                :aria-label="`${event.name} description`"
                rows="2"
                readonly
              />
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="editor-section">
      <h3>Events</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Clear</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in nonCoreEvents" :key="event.id">
            <td>
              <sl-input
                v-model="event.name"
                :aria-label="`${event.name || event.id} name`"
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
                type="button"
                class="clear-entry"
                :aria-label="`Clear ${event.name || event.id}`"
                title="Clear event"
                @click="clearEvent(event)"
              >
                <span class="mdi mdi-eraser" aria-hidden="true"></span>
              </button>
            </td>
            <td>
              <button
                v-if="!event.name.trim() && event.id !== newEvent.id"
                type="button"
                class="remove-entry"
                :aria-label="`Remove ${event.id}`"
                title="Remove event"
                @click="removeEvent(event)"
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

.core-events {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: #444;
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

.clear-entry,
.remove-entry {
  min-width: 32px;
  min-height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  background-color: var(--color-dark-bg);
  cursor: pointer;
}

.clear-entry:hover,
.remove-entry:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
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
