import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStateStore = defineStore('state', () => {
  const pointIndex = ref(-1)
  const statsScope = ref(0)

  return {
    pointIndex,
    statsScope,
  }
})
