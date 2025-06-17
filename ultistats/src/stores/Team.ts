// src/stores/Team.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player } from '@/types/Player'

// Define the store with the ID 'team'
export const useTeamStore = defineStore('team', () => {
  // --- State ---
  // Use ref to hold the array of Player objects
  const players = ref<Player[]>([
    // You can initialize with some default players if needed
    { id: 'p1', name: 'Thomas', isActive: false, key_code: 'Numpad7' },
    {
      id: 'p2',
      name: 'Guimsou',
      // number: 7,
      isActive: false,
      key_code: 'Numpad8',
      // modifiers: new Set(['NumpadEnter']),
    },
    { id: 'p3', name: 'Clar', isActive: false, key_code: 'Numpad9' },
    { id: 'p4', name: 'Toto', isActive: false, key_code: 'Numpad4' },
    { id: 'p5', name: 'Yann', isActive: false, key_code: 'Numpad5' },
    { id: 'p6', name: 'Matteo', isActive: false, key_code: 'Numpad6' },
    { id: 'p7', name: 'Lucian', isActive: false, key_code: 'Numpad1' },
    { id: 'p8', name: 'Lyloo', isActive: false, key_code: 'NumpadDivide' },
    { id: 'p9', name: 'Salma', isActive: false, key_code: 'NumpadMultiply' },
  ])

  // --- Getters ---
  // Example getter: Get only active players
  const activePlayers = computed(() => players.value.filter((p) => p.isActive))

  // Example getter: Get a player by their ID
  const getPlayerById = computed(() => {
    return (playerId: string) => players.value.find((p) => p.id === playerId)
  })
  function haveSameElements<T>(ref: Set<T>, comp: Set<T>): boolean {
    if (ref.size !== comp.size) {
      return false // Different number of elements
    }
    for (const element of ref) {
      if (!comp.has(element)) {
        return false // Missing element
      }
    }
    return true // All elements matched with correct frequencies
  }

  function getPlayerByKeyCodeAndModifiers(keycode: string, modifiers: Set<string>) {
    console.log('getPlayerByKeyCodeAndModifiers ', modifiers)
    return players.value.find(
      (p) =>
        p.key_code === keycode && haveSameElements(p.modifiers || new Set<string>(), modifiers),
    )
  }

  // --- Actions ---
  // Action to add a new player
  function addPlayer(newPlayer: Omit<Player, 'id' | 'isActive'>) {
    // Basic ID generation (consider a more robust method like UUID)
    const id = `player_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const playerToAdd: Player = {
      ...newPlayer,
      id: id,
      isActive: false, // Default new players to active
    }
    players.value.push(playerToAdd)
  }

  // Action to remove a player by ID
  function removePlayer(playerId: string) {
    players.value = players.value.filter((p) => p.id !== playerId)
  }

  // Action to update a player's details
  function updatePlayer(playerId: string, updatedInfo: Partial<Player>) {
    const playerIndex = players.value.findIndex((p) => p.id === playerId)
    if (playerIndex !== -1) {
      // Merge existing player data with updated info
      players.value[playerIndex] = { ...players.value[playerIndex], ...updatedInfo }
    } else {
      console.warn(`Player with ID ${playerId} not found for update.`)
    }
  }

  function selectActivePlayer(playerId: string | undefined) {
    players.value.forEach((player) => {
      player.isActive = player.id === playerId
    })
  }
  // --- Return ---
  // Make state, getters, and actions available to components
  return {
    // State
    players,
    // Getters
    activePlayers,
    getPlayerById,
    getPlayerByKeyCodeAndModifiers,
    // Actions
    addPlayer,
    removePlayer,
    updatePlayer,
    selectActivePlayer,
  }
})
