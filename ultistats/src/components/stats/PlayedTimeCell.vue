<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{ value: number }>()
function formatTime(time: number) {
  console.log('TIME', time)
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<template>
  <span>{{ formatTime(props.value) }}</span>
</template>
