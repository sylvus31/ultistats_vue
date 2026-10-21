<script setup lang="ts">
import LineSelector from './LineSelector.vue'
import { useJournalStore } from '../stores/journal'
import { computed, ref } from 'vue'
import { useTeamStore } from '../stores/Team'

const teamStore = useTeamStore()
const journalStore = useJournalStore()
const lineDialog = ref<HTMLDialogElement | null>(null)
const teamIds = computed(() => teamStore.teams.map((team) => team.id))
const linePlayerCount = computed(
  () => teamStore.playingPlayers.filter((player) => !teamIds.value.includes(player.id)).length,
)

const openLineSelector = () => {
  lineDialog.value?.showModal()
}

const clearLine = () => {
  teamStore.players
    .filter((player) => !teamIds.value.includes(player.id))
    .forEach((player) => teamStore.setPlayingStatus(player.id, false))
}

const saveLine = () => {
  const linePlayers = [
    ...teamStore.playingPlayers
      .filter((player) => !teamIds.value.includes(player.id))
      .map((player) => player.id),
    ...teamIds.value,
  ]
  journalStore.addLineEntry(new Set(linePlayers))
  lineDialog.value?.close()
}
</script>
<template>
  <sl-button @click="openLineSelector" class="pass-modifier-button">
    <span class="pass-modifier-name">Set line</span>
  </sl-button>
  <dialog
    ref="lineDialog"
    class="line-dialog dialog-base"
    aria-labelledby="line-dialog-title"
  >
    <div class="dialog-header">
      <h2 id="line-dialog-title">Set line</h2>
      <span class="line-count" aria-live="polite">{{ linePlayerCount }} players</span>
      <button class="close-button" type="button" aria-label="Close" @click="lineDialog?.close()">
        &times;
      </button>
    </div>
    <LineSelector />
    <div class="dialog-actions">
      <sl-button @click="clearLine">Clear all</sl-button>
      <sl-button @click="saveLine">Save line</sl-button>
    </div>
  </dialog>
</template>

<style scoped>
.pass-modifier-name {
  font-weight: bold;
  color: #00bcd4;
}
.pass-modifier-button {
  margin-left: 10px;
  padding: 2px 4px;
  min-width: 50px;
  max-width: 100px;
  background-color: #333; /* Dark background */
  color: #e0e0e0; /* Light text */
}

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
