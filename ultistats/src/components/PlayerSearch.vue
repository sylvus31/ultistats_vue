<script setup lang="ts">
import { computed, ref } from 'vue'
import type { JournalEntry } from '@/stores/journal'
import { useJournalStore } from '@/stores/journal'
import { useActionsStore } from '@/stores/ActionsStore'
import { useEventsStore } from '@/stores/EventsStore'
import { usePassesStore } from '@/stores/passesStore'
import { useTeamStore } from '@/stores/Team'
import type { VideoPlayerInstance } from '@/components/VideoPlayer.vue'
import { JournalEntryType as jet } from '@/types/journaltypes'

const props = defineProps<{
  videoPlayer: Pick<VideoPlayerInstance, 'goTo' | 'play'> | null
}>()

const journalStore = useJournalStore()
const teamStore = useTeamStore()
const actionsStore = useActionsStore()
const eventsStore = useEventsStore()
const passesStore = usePassesStore()
const selectedPlayerId = ref<string | null>(null)

const players = computed(() => teamStore.teams.flatMap((team) => team.players))
const occurrences = computed(() => {
  if (!selectedPlayerId.value) return []

  const records = journalStore.sortedRecords
  return records.flatMap((record, index) =>
    record.type === jet.PLAYER && record.name === selectedPlayerId.value
      ? [
          {
            record,
            previous: records[index - 1],
            next: records[index + 1],
          },
        ]
      : [],
  )
})

function getPlayerNameColor(playerId: string): string | undefined {
  const player = teamStore.getPlayerByID(playerId)
  if (!player) return undefined
  return teamStore.teams[teamStore.getPlayerTeam(player)]?.color
}

function getRecordName(record: JournalEntry | undefined): string {
  if (!record) return '—'

  switch (record.type) {
    case jet.PLAYER:
      return teamStore.getPlayerByID(record.name)?.name ?? '?'
    case jet.POSITIVE_ACTION:
    case jet.NEGATIVE_ACTION:
      return actionsStore.getActionByID(record.name)?.name ?? '?'
    case jet.PASS:
      return passesStore.getPassByID(record.name)?.name ?? '?'
    case jet.EVENT:
      return eventsStore.getEventByID(record.name)?.name ?? '?'
    case jet.COMMENT:
      return record.name
    case jet.LINE:
      return 'Ligne'
    default:
      return '?'
  }
}

function goToOccurrence(timestamp: number) {
  props.videoPlayer?.goTo(timestamp - 3)
  props.videoPlayer?.play()
}
</script>

<template>
  <div class="player-search">
    <div class="player-buttons" aria-label="Players">
      <sl-button
        v-for="player in players"
        :key="player.id"
        :class="{ active: selectedPlayerId === player.id }"
        :aria-pressed="selectedPlayerId === player.id"
        @click="selectedPlayerId = player.id"
      >
        <span
          class="player-name"
          :style="{ textDecorationColor: getPlayerNameColor(player.id) }"
          >{{ player.name }}</span
        >
      </sl-button>
    </div>

    <section class="results" aria-labelledby="player-search-results-title">
      <h3 id="player-search-results-title">Results</h3>
      <ol v-if="occurrences.length">
        <li v-for="occurrence in occurrences" :key="occurrence.record.id">
          <button
            type="button"
            class="result-entry"
            :aria-label="`Go to ${getRecordName(occurrence.record)} at ${occurrence.record.ts} seconds`"
            @click="goToOccurrence(occurrence.record.ts)"
          >
            <span>{{ getRecordName(occurrence.previous) }}</span>
            <strong>{{ getRecordName(occurrence.record) }}</strong>
            <span>{{ getRecordName(occurrence.next) }}</span>
          </button>
        </li>
      </ol>
      <p v-else-if="selectedPlayerId">No occurrences found.</p>
      <p v-else>Select a player to see their journal occurrences.</p>
    </section>
  </div>
</template>

<style scoped>
.player-search {
  margin: 5px;
}

.player-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35em;
}

.player-name {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.results {
  margin-top: 1em;
}

.results h3 {
  margin: 0 0 0.5em;
}

.results ol {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  max-height: 16em;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.result-entry {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 0.75em;
  width: 100%;
  padding: 0.5em;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-card-bg);
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
}

.result-entry span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-entry span:last-child {
  text-align: right;
}

.result-entry:hover {
  border-color: var(--color-accent);
}
</style>
