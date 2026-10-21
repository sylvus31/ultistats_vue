<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTeamStore } from '../stores/Team'
import LineSelector from './LineSelector.vue'

const emit = defineEmits<{
  save: [players: Set<string>]
}>()

const teamStore = useTeamStore()
const dialog = ref<HTMLDialogElement | null>(null)
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
  dialog.value?.showModal()
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
  <dialog ref="dialog" class="line-dialog dialog-base" aria-labelledby="line-dialog-title">
    <div class="dialog-header">
      <h2 id="line-dialog-title">Set line</h2>
      <span class="line-count" aria-live="polite">{{ playerCount }} players</span>
      <button class="close-button" type="button" aria-label="Close" @click="dialog?.close()">
        &times;
      </button>
    </div>
    <LineSelector v-model="selectedPlayers" />
    <div class="dialog-actions">
      <sl-button @click="clearAll">Clear all</sl-button>
      <sl-button @click="save">Save line</sl-button>
    </div>
  </dialog>
</template>

<style scoped>
.line-dialog {
  position: fixed;
  inset: 50% auto auto 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  width: min(600px, calc(100vw - 40px));
  max-height: calc(100vh - 40px);
  overflow: auto;
}

.line-dialog::backdrop {
  background-color: rgb(0 0 0 / 60%);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 var(--spacing-md);
  padding: var(--button-padding);
  min-width: 0;
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-md);
}

.line-count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dialog-header h2 {
  margin: 0;
  font-size: 1rem;
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}
</style>
