import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Event } from '@/types/EventsType'

const coreEventIds = new Set(['e2', 'e3', 'e4'])
const events = ref<Event[]>([])

export const useEventsStore = defineStore('eventsStore', () => {
  let hasImportedEvents = false

  const normalizeEvent = (event: Event): Event => ({
    ...event,
    core: coreEventIds.has(event.id) || event.core === true,
  })

  fetch('/events.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (hasImportedEvents) return
      events.value = data.map((event: Event) => normalizeEvent(event))
    })

  function setEvents(importedEvents: Event[]) {
    hasImportedEvents = true
    events.value = importedEvents.map(normalizeEvent)
  }

  function getEventByID(id: string): Event | undefined {
    return events.value?.find((e) => e.id === id)
  }

  return {
    events,
    setEvents,
    getEventByID,
  }
})
