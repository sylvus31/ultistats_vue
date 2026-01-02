// src/stores/Team.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPlayer, type Player } from '@/types/Player'

class Team {
  players: Player[]
  name: string
  constructor(name: string = '', players: Player[] = []) {
    this.name = name
    this.players = players
  }
}
const team_0 = new Team('BTR', [
  { id: 'p1', name: 'Thomas', isActive: false, key_code: 'Numpad7', playing: false },
  {
    id: 'p2',
    name: 'Guimsou',
    // number: 7,
    isActive: false,
    key_code: 'Numpad8',
    // modifiers: new Set(['NumpadEnter']),
    playing: false,
  },
  { id: 'p3', name: 'Clar', isActive: false, key_code: 'Numpad9', playing: false },
  { id: 'p4', name: 'Toto', isActive: false, key_code: 'Numpad4', playing: false },
  { id: 'p5', name: 'Yann', isActive: false, key_code: 'Numpad5', playing: false },
  { id: 'p6', name: 'Matteo', isActive: false, key_code: 'Numpad6', playing: false },
  { id: 'p7', name: 'Lucian', isActive: false, key_code: 'Numpad1', playing: false },
  { id: 'p8', name: 'Lyloo', isActive: false, key_code: 'NumpadDivide', playing: false },
  { id: 'p9', name: 'Salma', isActive: false, key_code: 'NumpadMultiply', playing: false },
])

const team_1 = new Team('ADVERSAIRE')
// Define the store with the ID 'team'
export const useTeamStore = defineStore('team', () => {
  const teams = ref<[Team, Team]>([team_0, team_1])
  const players = computed(() => {
    const p = [...teams.value[0].players, ...teams.value[1].players]
    p.push(createPlayer('t0', teams.value[0].name, 'KeyT'))
    p.push(createPlayer('t1', teams.value[1].name, 'KeyH'))
    return p
  })

  // --- Getters ---
  // Example getter: Get only active players
  const activePlayers = computed(() => players.value.filter((p) => p.isActive))
  const playingPlayers = computed(() => players.value.filter((player) => player.playing))
  const nonPlayingPlayers = computed(() => players.value.filter((player) => !player.playing))

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

  function getPlayerTeam(player: Player) {
    let index = -1
    teams.value.forEach((team, i) => {
      if (team.name === player.name || team.players?.find((p) => p.id === player.id)) {
        index = i
      }
    })
    return index
  }

  function getPlayerByName(name: string) {
    return players.value.find((p) => p.name === name)
  }

  function getPlayerByKeyCodeAndModifiers(keycode: string, modifiers: Set<string>) {
    return players.value.find(
      (p) =>
        p.key_code === keycode && haveSameElements(p.modifiers || new Set<string>(), modifiers),
    )
  }

  // Action to remove a player by ID
  function removePlayer(playerId: string) {
    teams.value.forEach((team) => {
      team.players = team.players.filter((player) => player.id !== playerId)
    })
  }

  function setPlayingStatus(playerId: string, playing: boolean) {
    const player = players.value.find((p) => p.id === playerId)
    if (player) {
      player.playing = playing
    }
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

  function setTeamName(teamIndex: number, teamName: string) {
    teams.value[teamIndex].name = teamName
    players.value.find((player) => {
      return player.id === 't' + teamIndex
    })!.name = teamName
  }

  function setPlayersOfTeam(teamIndex: number, teamPlayers: Player[]) {
    teams.value[teamIndex].players.splice(0)
    teams.value[teamIndex].players.push(...teamPlayers)
  }

  function clearTeams(name_1:string='Team 1',name_2:string='Team 2') {
    teams.value[0].name=name_1
    teams.value[0].players.splice(0)
    teams.value[1].name=name_2
    teams.value[1].players.splice(0)
  }
  // --- Return ---
  // Make state, getters, and actions available to components
  return {
    // State
    players,
    teams,
    setTeamName,
    setPlayersOfTeam,
    // Getters
    activePlayers,
    playingPlayers,
    nonPlayingPlayers,
    getPlayerById,
    getPlayerByKeyCodeAndModifiers,
    setPlayingStatus,
    // Actions
    removePlayer,
    updatePlayer,
    selectActivePlayer,
    getPlayerTeam,
    getPlayerByName,
    clearTeams,
  }
})
