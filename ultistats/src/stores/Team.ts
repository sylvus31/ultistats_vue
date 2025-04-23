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
    { id: 'p1', name: 'Alice', number: 10, isActive: false, key: '7' },
    { id: 'p2', name: 'Bob', number: 7, isActive: false, key: '8' },
    { id: 'p3', name: 'Charlie', isActive: false, key: '9' },
    { id: 'p4', name: 'David', isActive: false, key: '4' },
    { id: 'p5', name: 'Eve', isActive: false, key: '5' },
    { id: 'p6', name: 'Frank', isActive: false, key: '6' },
    { id: 'p7', name: 'Grace', isActive: false },
  ])

  // --- Getters ---
  // Example getter: Get only active players
  const activePlayers = computed(() => players.value.filter((p) => p.isActive))

  // Example getter: Get a player by their ID
  const getPlayerById = computed(() => {
    return (playerId: string) => players.value.find((p) => p.id === playerId)
  })

  // --- Actions ---
  // Action to add a new player
  function addPlayer(newPlayer: Omit<Player, 'id' | 'isActive'>) {
    // Basic ID generation (consider a more robust method like UUID)
    const id = `player_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const playerToAdd: Player = {
      ...newPlayer,
      id: id,
      isActive: true, // Default new players to active
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

  // Action to toggle a player's active status
  function togglePlayerStatus(playerId: string) {
    const player = getPlayerById.value(playerId) // Use the getter
    if (player) {
      player.isActive = !player.isActive
    }
  }

  function selectActivePlayer(playerId: string) {
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
    // Actions
    addPlayer,
    removePlayer,
    updatePlayer,
    togglePlayerStatus,
    selectActivePlayer,
  }
})
