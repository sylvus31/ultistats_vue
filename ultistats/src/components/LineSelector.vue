<script setup lang="ts">
import { computed } from 'vue'
import { useTeamStore } from '../stores/Team'
import { storeToRefs } from 'pinia'

const playerStore = useTeamStore()
const { players } = storeToRefs(playerStore)

const playingPlayers = computed(() => players.value.filter((player) => player.playing))
const nonPlayingPlayers = computed(() => players.value.filter((player) => !player.playing))
</script>

<template>
  <div class="lists-container">
    <div class="list">
      <h3>Playing</h3>
      <ul>
        <li
          v-for="player in playingPlayers"
          :key="player.id"
          @click="playerStore.setPlayingStatus(player.id, false)"
        >
          {{ player.name }}
        </li>
      </ul>
    </div>
    <div class="list">
      <h3>Not Playing</h3>
      <ul>
        <li
          v-for="player in nonPlayingPlayers"
          :key="player.id"
          @click="playerStore.setPlayingStatus(player.id, true)"
        >
          {{ player.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.lists-container {
  display: flex;
  justify-content: space-between;
}
.list {
  width: 45%;
}
</style>
