<template>
  <div
    ref="windowContainer"
    class="window-container"
    :class="{
      'window-container-fullscreen': isFullscreen,
      'window-container-vertically-expanded': isVerticallyExpanded,
    }"
    :style="verticalExpansionStyle"
  >
    <div class="title-bar">
      <div class="title">{{ title }}</div>
      <div class="title-menu"><slot name="menu" /></div>
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
        <button
          v-if="allowVerticalExpand"
          class="icon-button"
          type="button"
          :title="isVerticallyExpanded ? 'Restore height' : 'Expand vertically'"
          :aria-label="isVerticallyExpanded ? 'Restore height' : 'Expand vertically'"
          @click="toggleVerticalExpand"
        >
          <span
            class="mdi"
            :class="
              isVerticallyExpanded ? 'mdi-arrow-collapse-vertical' : 'mdi-arrow-expand-vertical'
            "
            aria-hidden="true"
          ></span>
        </button>
        <slot name="before-edit" />
        <button v-if="allowEdit" class="icon-button" @click="edit" title="Edit">
          <span class="mdi mdi-pencil"></span>
        </button>
        <button class="icon-button" @click="minimize" :title="isMinimized ? 'Expand' : 'Collapse'">
          <span class="mdi" :class="isMinimized ? 'mdi-plus' : 'mdi-minus'"></span>
        </button>
      </div>
    </div>
    <div
      v-show="!isMinimized"
      class="window-content"
      :class="{ 'window-content-vertically-expanded': isVerticallyExpanded }"
    >
      <slot name="main" />
    </div>
    <ModalDialog ref="editorDialog" :title="`Edit ${title}`" :width="760">
      <component :is="editorComponentToShow" v-if="editorComponentToShow" />
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, type Component } from 'vue'
import ModalDialog from './ModalDialog.vue'

const props = withDefaults(
  defineProps<{
    title: string
    editorComponent?: string
    allowEdit?: boolean
    allowFullscreen?: boolean
    allowVerticalExpand?: boolean
  }>(),
  {
    allowEdit: false,
    allowFullscreen: false,
    allowVerticalExpand: false,
  },
)

const isMinimized = ref(false)
const isFullscreen = ref(false)
const isVerticallyExpanded = ref(false)
const windowContainer = ref<HTMLElement | null>(null)
const verticalMaxHeight = ref<number | null>(null)
const verticalExpansionStyle = computed(() =>
  verticalMaxHeight.value === null ? undefined : { maxHeight: `${verticalMaxHeight.value}px` },
)
const editorDialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const editorComponentToShow = shallowRef<Component | null>(null)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const updateVerticalMaxHeight = () => {
  if (!isVerticallyExpanded.value || !windowContainer.value) return

  const top = windowContainer.value.getBoundingClientRect().top
  verticalMaxHeight.value = Math.max(0, window.innerHeight - Math.max(0, top) - 16)
}

const removeVerticalExpansionListeners = () => {
  window.removeEventListener('resize', updateVerticalMaxHeight)
  window.removeEventListener('scroll', updateVerticalMaxHeight, true)
}

const toggleVerticalExpand = async () => {
  isVerticallyExpanded.value = !isVerticallyExpanded.value
  if (isVerticallyExpanded.value) {
    await nextTick()
    if (!windowContainer.value) return
    updateVerticalMaxHeight()
    window.addEventListener('resize', updateVerticalMaxHeight)
    window.addEventListener('scroll', updateVerticalMaxHeight, true)
    return
  }

  removeVerticalExpansionListeners()
  verticalMaxHeight.value = null
}

const minimize = () => {
  isMinimized.value = !isMinimized.value
}

onBeforeUnmount(removeVerticalExpansionListeners)

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
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.window-container-vertically-expanded {
  display: flex;
  flex-direction: column;
}

.window-content-vertically-expanded {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-sm);
  padding: var(--button-padding);
  gap: var(--spacing-sm);
  min-width: var(--button-min-width);
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  text-align: center;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
}

.title {
  font-weight: bold;
  white-space: nowrap;
}

.title-menu {
  display: flex;
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
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

.actions :slotted(.icon-button) {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: color 0.2s ease;
}

.actions :slotted(.icon-button:hover) {
  color: var(--color-accent);
}
</style>
