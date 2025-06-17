import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pass, passModifier } from '@/types/Passes'
import { useKeyboardStore } from './keyboardStore'
import { KeyboardConstants } from '@/types/keyConstants'

export const usePassesStore = defineStore('passesStore', () => {
  // Use ref to hold the array of Player objects
  const passesModifiers = ref<passModifier[]>([
    { id: 'pm1', name: 'longue', isActive: false, key: KeyboardConstants.SHIFT },
    { id: 'pm2', name: 'break', isActive: false, key: KeyboardConstants.CTRL },
  ])
  const passes = ref<Pass[]>([
    { id: 'a6', name: 'Hammer', isActive: false, key: 'KeyQ', legend: 'A' },
    { id: 'a2', name: 'Avant', isActive: false, key: 'KeyW', legend: 'Z' },
    { id: 'a5', name: 'Knife', isActive: false, key: 'KeyE', legend: 'E' },
    { id: 'a7', name: 'Skoober', isActive: false, key: 'KeyR', legend: 'R' },
    { id: 'a1', name: 'Passe', isActive: false, key: 'KeyS', legend: 'S' },
    { id: 'a3', name: 'Dump', isActive: false, key: 'KeyD', legend: 'D' },
    { id: 'a4', name: 'Swing', isActive: false, key: 'KeyA', legend: 'Q' },
  ])

  // --- Getters ---
  // Example getter: Get only active players
  const activePass = computed(() => passes.value.filter((p) => p.isActive))

  // Example getter: Get a player by their ID
  const getpassById = computed(() => {
    return (playerId: string) => passes.value.find((p) => p.id === playerId)
  })

  // Action to toggle a player's active status
  function togglePasStatus(actionId: string) {
    const action = getpassById.value(actionId) // Use the getter
    if (action) {
      action.isActive = !action.isActive
    }
  }

  function selectActivePass(playerId: string) {
    passes.value.forEach((action) => {
      action.isActive = action.id === playerId
    })
  }

  function getActionByKey(key: string) {
    return passes.value.find((action) => action.key === key)
  }

  // --- Return ---
  // Make state, getters, and actions available to components
  return {
    // State
    passes,
    // Getters
    activePass,
    getpassById,
    getActionByKey,
    // Actions
    togglePasStatus,
    selectActivePass,
  }
})
