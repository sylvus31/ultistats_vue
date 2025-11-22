<template>
  <div class="free-comment">
    <div class="button-container">
      <v-text-field
        label="title"
        variant="outlined"
        clearable
        @focusin="handleGetFocus"
        @focusout="handleLosseFocus"
        v-model="title"
      />
      <sl-button :disabled="!title" @click="addComment">Add</sl-button>
      <sl-button @click="clearComment">Clear</sl-button>
    </div>
    <v-textarea
      label="description"
      variant="outlined"
      clearable
      @focusin="handleGetFocus"
      @focusout="handleLosseFocus"
      v-model="description"
    />
  </div>
</template>

<script lang="ts" setup>
import { useKeyboardStore } from '../stores/keyboardStore'
import { VTextarea, VTextField } from 'vuetify/components'
import { useJournalStore } from '@/stores/journal'
import { ref } from 'vue'

const componentId = 'FreeComment'
const keyboardStore = useKeyboardStore()
const journalStore = useJournalStore()
const title = ref('')
const description = ref('')

const handleGetFocus = () => {
  keyboardStore.requestFocus(componentId)
}

const handleLosseFocus = () => {
  keyboardStore.freeFocus()
}

const addComment = () => {
  console.log('add comment')
  journalStore.addCommentEntry(title.value, description.value)
}
const clearComment = () => {
  console.log('clear comment')
  title.value = ''
  description.value = ''
}
</script>

<style scoped>
.free-comment {
  display: flex;
  flex-direction: column;
  margin: 5px;
}
.free-comment > * {
  margin-bottom: 1em;
}
.button-container {
  display: flex;
  gap: 10px;
  margin-right: 5px;
}
</style>
