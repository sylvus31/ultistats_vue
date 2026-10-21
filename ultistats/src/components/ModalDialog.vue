<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'

withDefaults(
  defineProps<{
    title: string
    width?: number
  }>(),
  {
    width: 600,
  },
)

const emit = defineEmits<{
  close: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const isOpen = ref(false)
const titleId = useId()

const open = async () => {
  if (isOpen.value) return
  isOpen.value = true
  await nextTick()
  dialog.value?.showModal()
}

const close = () => {
  dialog.value?.close()
}

const handleClose = () => {
  isOpen.value = false
  emit('close')
  requestAnimationFrame(() => {
    document.getElementById('app')?.focus()
  })
}

defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialog"
    class="modal-dialog dialog-base"
    :style="{ '--modal-dialog-width': `${width}px` }"
    :aria-labelledby="titleId"
    @close="handleClose"
  >
    <div class="dialog-header">
      <h2 :id="titleId">{{ title }}</h2>
      <slot name="header-extra" />
      <button class="close-button" type="button" aria-label="Close" @click="close">
        &times;
      </button>
    </div>
    <div v-if="isOpen" class="dialog-content">
      <slot />
    </div>
    <div v-if="isOpen && $slots.actions" class="dialog-actions">
      <slot name="actions" />
    </div>
  </dialog>
</template>

<style scoped>
.modal-dialog {
  position: fixed;
  inset: 50% auto auto 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  width: min(var(--modal-dialog-width), calc(100vw - 40px));
  max-height: calc(100vh - 40px);
  overflow: auto;
}

.modal-dialog::backdrop {
  background-color: rgb(0 0 0 / 60%);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin: 0 0 var(--spacing-md);
  padding: var(--button-padding);
  min-width: 0;
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
}

.dialog-header h2 {
  margin: 0;
  color: var(--color-text-light);
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-md);
}

.close-button {
  flex: 0 0 auto;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}
</style>
