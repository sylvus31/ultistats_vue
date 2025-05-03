<template>
  <div class="button-container">
    <div class="title-bar">
      <div class="title">{{ title }}</div>
      <div class="actions">
        <button class="edit-button" @click="edit">Edit</button>
        <button class="minimize-button" @click="minimize">
          <span class="mdi" :class="isMinimized ? 'mdi-plus' : 'mdi-minus'"></span>
        </button>
      </div>
    </div>
    <div v-show="!isMinimized"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineProps } from 'vue'

defineProps({
  title: String,
})

const isMinimized = ref(false)

const minimize = () => {
  isMinimized.value = !isMinimized.value
}
const edit = () => {
  console.log('edit')
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
