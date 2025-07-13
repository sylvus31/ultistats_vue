<script setup lang="ts">
import { defineProps } from 'vue'
import type { ColumnDataSchemaModel } from '@revolist/vue3-datagrid'

const props = defineProps<ColumnDataSchemaModel>()
function formatTime(time: number) {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<template>
  <span>{{ formatTime(props.value) }}</span>
</template>
