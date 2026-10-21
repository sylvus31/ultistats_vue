<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTeamStore } from '../stores/Team'
import LineSelector from './LineSelector.vue'
import ModalDialog from './ModalDialog.vue'

const emit = defineEmits<{
  save: [players: Set<string>]
}>()

const teamStore = useTeamStore()
const dialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const selectedPlayers = ref(new Set<string>())
const playerCount = computed(() => selectedPlayers.value.size)

const open = (players: Set<string>) => {
  const teamIds = teamStore.teams.map((team) => team.id)
  const teamNames = teamStore.teams.map((team) => team.name)
  selectedPlayers.value = new Set(
    [...players].flatMap((player) => {
      if (teamIds.includes(player) || teamNames.includes(player)) return []
      const rosterPlayer = teamStore.players.find(
        (candidate) => candidate.id === player || candidate.name === player,
      )
      return rosterPlayer ? [rosterPlayer.id] : []
    }),
  )
  dialog.value?.open()
}

const clearAll = () => {
  selectedPlayers.value = new Set()
}

const save = () => {
  const teamIds = teamStore.teams.map((team) => team.id)
  emit('save', new Set([...selectedPlayers.value, ...teamIds]))
  dialog.value?.close()
}

defineExpose({ open })
</script>

<template>
  <ModalDialog ref="dialog" title="Set line">
    <template #header-extra>
      <span class="line-count" aria-live="polite">{{ playerCount }} players</span>
    </template>
    <LineSelector v-model="selectedPlayers" />
    <template #actions>
      <sl-button @click="clearAll">Clear all</sl-button>
      <sl-button @click="save">Save line</sl-button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.line-count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
