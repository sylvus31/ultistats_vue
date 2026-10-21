<template>
  <div class="window-container">
    <div class="title-bar">
      <div class="title">{{ title }}</div>
      <div><slot name="menu" /></div>
      <div class="actions">
        <button class="icon-button" @click="edit" title="Edit">
          <span class="mdi mdi-pencil"></span>
        </button>
        <button class="icon-button" @click="minimize" :title="isMinimized ? 'Expand' : 'Collapse'">
          <span class="mdi" :class="isMinimized ? 'mdi-plus' : 'mdi-minus'"></span>
        </button>
      </div>
    </div>
    <div v-show="!isMinimized"><slot name="main" /></div>
    <dialog
      ref="editorDialog"
      class="editor-dialog dialog-base"
      :aria-labelledby="editorDialogTitleId"
      @close="closeEditor"
    >
      <div class="editor-dialog-header">
        <h2 :id="editorDialogTitleId">Edit {{ title }}</h2>
        <button class="close-button" type="button" aria-label="Close" @click="editorDialog?.close()">
          &times;
        </button>
      </div>
      <component :is="editorComponentToShow" v-if="editorComponentToShow" />
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, shallowRef, useId, type Component } from 'vue'

const props = defineProps({
  title: String,
  editorComponent: String,
})

const isMinimized = ref(false)
const editorDialogTitleId = useId()
const editorDialog = ref<HTMLDialogElement | null>(null)
const editorComponentToShow = shallowRef<Component | null>(null)

const minimize = () => {
  isMinimized.value = !isMinimized.value
}

const edit = async () => {
  if (!props.editorComponent) return

  const component = await import(props.editorComponent)
  editorComponentToShow.value = component.default || component
  await nextTick()
  editorDialog.value?.showModal()
}

const closeEditor = () => {
  editorComponentToShow.value = null
}
</script>

<style scoped>
.window-container {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  width: 100%;
  background-color: var(--color-dark-bg);
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-sm);
  padding: var(--button-padding);
  min-width: var(--button-min-width);
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  text-align: center;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
}

.title {
  font-weight: bold;
}

.editor-dialog {
  position: fixed;
  inset: 50% auto auto 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  width: min(760px, calc(100vw - 40px));
  max-height: calc(100vh - 40px);
  overflow: auto;
}

.editor-dialog::backdrop {
  background-color: rgb(0 0 0 / 60%);
}

.editor-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 var(--spacing-md);
  padding: var(--button-padding);
  background-color: var(--color-darker-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
}

.editor-dialog-header h2 {
  margin: 0;
  color: var(--color-text-light);
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

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.icon-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: color 0.2s ease;
}

.icon-button:hover {
  color: var(--color-accent);
}
</style>
