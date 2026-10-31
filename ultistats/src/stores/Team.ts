// src/stores/Team.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { createPlayer, type Player } from '@/types/Player'
import { normalizeShortcutKey } from '@/types/keyConstants'

class Team {
  players: Player[]
  name: string
  id: string
  constructor(name: string = '', id: string, players: Player[] = []) {
    this.name = name
    this.players = players
    this.id = id
  }
}
interface TeamData {
  id: string
  name: string
  players: Array<{
    id: string
    name: string
    key_code?: string
    modifiers?: string[]
    number?: number
  }>
}

// Define the store with the ID 'team'
export const useTeamStore = defineStore('team', () => {
  const teams = ref<[Team, Team]>([new Team('', 't0'), new Team('', 't1')])
  const teamShortcutPlayers = ref<[Player, Player]>([
    createPlayer('t0', teams.value[0].name, 't'),
    createPlayer('t1', teams.value[1].name, 'h'),
  ])
  const loadDefaultTeams = async () => {
    const response = await fetch('/teams.json')
    if (!response.ok) {
      throw new Error(`Failed to load default teams: ${response.status} ${response.statusText}`)
    }

    const defaultTeams = (await response.json()) as TeamData[]
    if (!Array.isArray(defaultTeams) || defaultTeams.length !== 2) {
      throw new Error('Default teams file must contain exactly two teams')
    }

    const hasExistingTeamData = teams.value.some(
      (team) => team.name !== '' || team.players.length > 0,
    )
    if (hasExistingTeamData) return

    const loadedTeams = defaultTeams.map(
      (team) =>
        new Team(
          team.name,
          team.id,
          team.players.map((player) => ({
            ...createPlayer(
              player.id,
              player.name,
              player.key_code ? normalizeShortcutKey(player.key_code) : undefined,
              new Set(player.modifiers ?? []),
              player.number,
            ),
          })),
        ),
    ) as [Team, Team]
    teams.value = loadedTeams
  }
  void loadDefaultTeams().catch((error: unknown) => {
    console.error('Unable to load default teams.', error)
  })
  watch(
    () => teams.value.map((team) => team.name),
    ([team0Name, team1Name]) => {
      teamShortcutPlayers.value[0].name = team0Name
      teamShortcutPlayers.value[1].name = team1Name
    },
    { immediate: true },
  )
  const players = computed(() => {
    return [...teams.value[0].players, ...teams.value[1].players, ...teamShortcutPlayers.value]
  })

  // --- Getters ---
  // Example getter: Get only active players
  const activePlayers = computed(() => players.value.filter((p) => p.isActive))
  const playingPlayers = computed(() => players.value.filter((player) => player.playing))
  const nonPlayingPlayers = computed(() => players.value.filter((player) => !player.playing))

  function haveSameElements<T>(ref: Set<T>, comp: Set<T>): boolean {
    ref = ref ? ref : new Set<T>()
    comp = comp ? comp : new Set<T>()
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

  function getPlayerByID(id: string) {
    return players.value.find((p) => p.id === id)
  }

  function getPlayerByKeyCodeAndModifiers(keycode: string, modifiers: Set<string>) {
    const normalizedKey = normalizeShortcutKey(keycode)
    return players.value.find(
      (p) =>
        (p.key_code && normalizeShortcutKey(p.key_code)) === normalizedKey &&
        haveSameElements(p.modifiers || new Set<string>(), modifiers),
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

  function setTeamNameAndID(teamIndex: number, teamName: string, teamID: string) {
    teams.value[teamIndex].name = teamName
    teams.value[teamIndex].id = teamID
  }

  function setPlayersOfTeam(teamIndex: number, teamPlayers: Player[]) {
    teams.value[teamIndex].players.splice(0)
    teams.value[teamIndex].players.push(...teamPlayers)
  }

  function clearTeams(name_1: string = 'Team 1', name_2: string = 'Team 2') {
    teams.value[0].name = name_1
    teams.value[0].players.splice(0)
    teams.value[1].name = name_2
    teams.value[1].players.splice(0)
  }
  // --- Return ---
  // Make state, getters, and actions available to components
  return {
    // State
    players,
    teams,
    setTeamNameAndID,
    setPlayersOfTeam,
    // Getters
    activePlayers,
    playingPlayers,
    nonPlayingPlayers,
    getPlayerByKeyCodeAndModifiers,
    setPlayingStatus,
    getPlayerByID,
    // Actions
    removePlayer,
    updatePlayer,
    selectActivePlayer,
    getPlayerTeam,
    clearTeams,
  }
})
