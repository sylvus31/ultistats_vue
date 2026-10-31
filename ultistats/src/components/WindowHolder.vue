<template>
  <div class="window-container" :class="{ 'window-container-fullscreen': isFullscreen }">
    <div class="title-bar">
      <div class="title">{{ title }}</div>
      <div><slot name="menu" /></div>
      <div class="actions">
        <button
          v-if="allowFullscreen"
          class="icon-button"
          type="button"
          :title="isFullscreen ? 'Restore' : 'Open full window'"
          :aria-label="isFullscreen ? 'Restore window' : 'Open full window'"
          @click="toggleFullscreen"
        >
          <span
            class="mdi"
            :class="isFullscreen ? 'mdi-window-restore' : 'mdi-window-maximize'"
            aria-hidden="true"
          ></span>
        </button>
        <button class="icon-button" @click="edit" title="Edit">
          <span class="mdi mdi-pencil"></span>
        </button>
        <button class="icon-button" @click="minimize" :title="isMinimized ? 'Expand' : 'Collapse'">
          <span class="mdi" :class="isMinimized ? 'mdi-plus' : 'mdi-minus'"></span>
        </button>
      </div>
    </div>
    <div v-show="!isMinimized" class="window-content"><slot name="main" /></div>
    <ModalDialog ref="editorDialog" :title="`Edit ${title}`" :width="760">
      <component :is="editorComponentToShow" v-if="editorComponentToShow" />
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, shallowRef, type Component } from 'vue'
import ModalDialog from './ModalDialog.vue'

const props = withDefaults(
  defineProps<{
    title: string
    editorComponent?: string
    allowFullscreen?: boolean
  }>(),
  {
    allowFullscreen: false,
  },
)

const isMinimized = ref(false)
const isFullscreen = ref(false)
const editorDialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const editorComponentToShow = shallowRef<Component | null>(null)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const minimize = () => {
  isMinimized.value = !isMinimized.value
}

const edit = async () => {
  if (!props.editorComponent) return

  const component = await import(props.editorComponent)
  editorComponentToShow.value = component.default || component
  await nextTick()
  editorDialog.value?.open()
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

.window-container-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  margin: 0;
  border-radius: 0;
}

.window-container-fullscreen .window-content {
  min-height: 0;
  flex: 1;
  overflow: auto;
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

.actions {
  display: flex;
  align-items: center;
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
