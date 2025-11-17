<template>
  <div class="free-comment">
    <div class="button-container">
      <v-text-field label="title" variant="outlined" v-model="title"
      @focusin="handleGetFocus"
      @focusout="handleLosseFocus"/>
      <sl-button @click="addComment">Add</sl-button>
      <sl-button @click="clearComment">Clear</sl-button>
    </div>
    <v-textarea label="description" variant="outlined" v-model="description"
      @focusin="handleGetFocus"
      @focusout="handleLosseFocus"/>
  </div>
</template>

<script lang="ts" setup>
import { useKeyboardStore } from '../stores/keyboardStore'
import { VTextarea, VTextField } from 'vuetify/components'
const componentId = 'FreeComment'
const keyboardStore = useKeyboardStore()
const handleGetFocus = () => {
  keyboardStore.requestFocus(componentId)
}

const handleLosseFocus = () => {
  keyboardStore.freeFocus()
}
</script>

<style scoped>
.free-comment {
  display: flex;
  flex-direction: column;
}
.free-comment > * {
  margin-bottom: 1em;
}
.button-container {
  display: flex;
  gap: 10px;
}
</style>
