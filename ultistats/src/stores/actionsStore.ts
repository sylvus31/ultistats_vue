import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Action } from '@/types/Action'

export const useActionStore = defineStore('actionStore', () => {
  // Use ref to hold the array of Player objects
  const actions = ref<Action[]>([
    // You can initialize with some default players if needed
    { id: 'a1', name: 'Passe', isActive: false, key: 's' },
    { id: 'a2', name: 'Avant', isActive: false, key: 'z' },
    { id: 'a3', name: 'Dump', isActive: false, key: 'd' },
    { id: 'a4', name: 'Swing', isActive: false, key: 'q' },
    { id: 'a5', name: 'Skoober', isActive: false, key: 'e' },
    { id: 'a6', name: 'Hammer', isActive: false, key: 'a' },
    { id: 'a7', name: 'Passe', isActive: false, key: 'S' },
    { id: 'a8', name: 'Avant', isActive: false, key: 'Z' },
    { id: 'a9', name: 'Dump', isActive: false, key: 'D' },
    { id: 'a10', name: 'Swing', isActive: false, key: 'Q' },
    { id: 'a11', name: 'Skoober', isActive: false, key: 'E' },
    { id: 'a12', name: 'Hammer', isActive: false, key: 'A' },
  ])

  // --- Getters ---
  // Example getter: Get only active players
  const activeActions = computed(() => actions.value.filter((p) => p.isActive))

  // Example getter: Get a player by their ID
  const getActionById = computed(() => {
    return (playerId: string) => actions.value.find((p) => p.id === playerId)
  })

  // Action to toggle a player's active status
  function toggleActionStatus(actionId: string) {
    const action = getActionById.value(actionId) // Use the getter
    if (action) {
      action.isActive = !action.isActive
    }
  }

  function selectActiveAction(playerId: string) {
    actions.value.forEach((action) => {
      action.isActive = action.id === playerId
    })
  }

  // --- Return ---
  // Make state, getters, and actions available to components
  return {
    // State
    actions,
    // Getters
    activeActions,
    getActionById,
    // Actions
    toggleActionStatus,
    selectActiveAction,
  }
})
