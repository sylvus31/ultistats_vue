import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pass, passModifier } from '@/types/Passes'
import { KeyboardConstants, normalizeShortcutKey } from '@/types/keyConstants'

export const usePassesStore = defineStore('passesStore', () => {
  // Use ref to hold the array of Player objects
  const passesModifiers = ref<passModifier[]>([
    { id: 'pm1', name: 'longue', isActive: false, key: KeyboardConstants.SHIFT },
    { id: 'pm2', name: 'break', isActive: false, key: KeyboardConstants.CTRL },
    { id: 'pm3', name: 'Off-hand', isActive: false, key: KeyboardConstants.ALT },
  ])
  const passes = ref<Pass[]>([
    { id: 'a6', name: 'Hammer', isActive: false, key: 'q' },
    { id: 'a2', name: 'Avant', isActive: false, key: 'w' },
    { id: 'a5', name: 'Knife', isActive: false, key: 'e' },
    { id: 'a7', name: 'Skoober', isActive: false, key: 'r' },
    { id: 'a3', name: 'Dump', isActive: false, key: 'd' },
    { id: 'a4', name: 'Swing', isActive: false, key: 'a' },
  ])

  // --- Getters ---
  const activePass = computed(() => passes.value.filter((p) => p.isActive))

  const getPassByID = computed(() => {
    return (playerId: string) => passes.value.find((p) => p.id === playerId)
  })

  // Action to toggle a player's active status
  function togglePasStatus(actionId: string) {
    const action = getPassByID.value(actionId) // Use the getter
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
    const normalizedKey = normalizeShortcutKey(key)
    return passes.value.find((action) => action.key === normalizedKey)
  }

  function getModifierByKey(key: string) {
    return passesModifiers.value.find((action) => action.key === key)
  }

  function toggleModifierStatus(modifier: passModifier) {
    modifier.isActive = !modifier.isActive
  }

  function setModifierStatus(modifier: passModifier, status: boolean) {
    modifier.isActive = status
  }

  function getActiveModifiers() {
    return passesModifiers.value.filter((modifier) => modifier.isActive)
  }

  function resetModifiers() {
    passesModifiers.value.forEach((modifier) => {
      modifier.isActive = false
    })
  }

  function setPasses(importedPasses: Pass[], importedModifiers?: passModifier[]) {
    passes.value = importedPasses.map((pass) => ({
      ...pass,
      modifiers: pass.modifiers ? new Set(pass.modifiers) : undefined,
    }))
    if (Array.isArray(importedModifiers)) {
      passesModifiers.value = importedModifiers
    }
  }

  // --- Return ---
  // Make state, getters, and actions available to components
  return {
    // State
    passes,
    passesModifiers,
    setPasses,
    // Getters
    activePass,
    getPassByID,
    getActionByKey,
    // passes
    togglePasStatus,
    selectActivePass,
    // Modifiers
    toggleModifierStatus,
    getModifierByKey,
    setModifierStatus,
    getActiveModifiers,
    resetModifiers,
  }
})
