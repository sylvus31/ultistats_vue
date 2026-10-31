import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pass, passModifier } from '@/types/Passes'
import { normalizeShortcutKey } from '@/types/keyConstants'

export const usePassesStore = defineStore('passesStore', () => {
  const passesModifiers = ref<passModifier[]>([])
  const passes = ref<Pass[]>([])
  let hasExplicitPasses = false

  const loadDefaultPasses = async () => {
    const response = await fetch('/passes.json')
    if (!response.ok) {
      throw new Error(`Failed to load default passes: ${response.status} ${response.statusText}`)
    }

    const defaults = (await response.json()) as {
      passes: Pass[]
      passesModifiers: passModifier[]
    }
    if (!Array.isArray(defaults.passes) || !Array.isArray(defaults.passesModifiers)) {
      throw new Error('Default passes file must include passes and passesModifiers arrays')
    }
    if (hasExplicitPasses || passes.value.length > 0 || passesModifiers.value.length > 0) return
    setPasses(defaults.passes, defaults.passesModifiers)
  }
  void loadDefaultPasses().catch((error: unknown) => {
    console.error('Unable to load default passes.', error)
  })

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
    hasExplicitPasses = true
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
