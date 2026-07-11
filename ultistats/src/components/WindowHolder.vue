<template>
  <div class="button-container">
    <div class="title-bar">
      <div class="title">{{ title }}</div>
      <div><slot name="menu" /></div>
      <div class="actions">
        <button class="edit-button" @click="edit">
          <span class="mdi" :class="'mdi-pencil'"></span>
        </button>
        <button class="minimize-button" @click="minimize">
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
.button-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px;
  padding: 5px 10px;
  min-width: 100px;
  background-color: #333; /* Dark background */
  color: #e0e0e0; /* Light text */
  text-align: center;
  border-radius: 5px;
  border: 2px solid #444; /* Darker border */
}

.title {
  font-weight: bold;
}

.modal {
  display: none; /* Hidden by default */
  z-index: 1; /* Sit on top */

  transform: translate(-50%, -50%);

  overflow: auto; /* Enable scroll if needed */
}
dialog{
  top: 50%;
  left: 50%;
  position: fixed; /* Stay in place */
}
dialog::backdrop {
  background-color: rgba(0,0,0,0.6); /* Black w/ opacity */
}
.actions {
  display: flex;
  gap: 5px;
}

.edit-button,
.minimize-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #e0e0e0; /* Light text */
}
</style>
