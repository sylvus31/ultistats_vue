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
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent} from 'vue'
import { DialogModal } from 'v-dialogs'

const props = defineProps({
  title: String,
  editorComponent:String
})

const isMinimized = ref(false)

const minimize = () => {
  isMinimized.value = !isMinimized.value
}

const dynamicComponent = ref(null)

const edit = async() => {
  console.log('editorComponent a', props.editorComponent)
  const component = await import(props.editorComponent)
  dynamicComponent.value = component.default || component
  DialogModal(
    component.default,
    {
      title: 'Edit ' + props.title,
    }
  )
}

const closeEditor = () => {
  const dialog = document.getElementById('modal') as HTMLDialogElement
  dialog.close()
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

dialog {
  top: 50%;
  left: 50%;
  position: fixed;
  transform: translate(-50%, -50%);
}

dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
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
