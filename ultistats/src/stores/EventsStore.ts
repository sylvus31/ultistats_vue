import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Event } from '@/types/EventsType'

const events = ref<Event[]>()

export const useEventsStore = defineStore('eventsStore', () => {
  fetch('/events.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let nb = 1
      events.value = []
      data.forEach((event: { name: string }) => {
        events.value?.push({
          id: 'e' + nb,
          name: event.name,
        })
        nb++
      })
    })

  function getEventByID(id: string): Event | undefined {
    return events.value?.find((e) => e.id === id)
  }

  return {
    events,
    getEventByID,
  }
})
