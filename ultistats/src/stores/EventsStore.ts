import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Event } from '@/types/EventsType'

const events = ref<Event[]>([])

export const useEventsStore = defineStore('eventsStore', () => {
  let hasImportedEvents = false

  fetch('/events.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (hasImportedEvents) return
      let nb = 1
      events.value = []
      data.forEach((event: { name: string; description?: string }) => {
        events.value?.push({
          id: 'e' + nb,
          name: event.name,
          description: event.description,
        })
        nb++
      })
    })

  function setEvents(importedEvents: Event[]) {
    hasImportedEvents = true
    events.value = importedEvents
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
