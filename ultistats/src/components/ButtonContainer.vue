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
    <div class="buttons" v-show="!isMinimized"><component :is="AsyncComp" v-if="AsyncComp" /></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineProps } from 'vue'
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  title: String,
  childComponent: String,
})
const AsyncComp = defineAsyncComponent(() => import(`./sub/${props.childComponent}.vue`))

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
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
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
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  gap: 10px;
}
</style>
