<script setup lang="ts">
import { defineProps } from 'vue'
import type { ColumnDataSchemaModel } from '@revolist/vue3-datagrid'

const props = defineProps<ColumnDataSchemaModel>()
function showTargets(targets: Map<string, number>) {
  let str = ''
  const sortedTargets = new Map([...targets.entries()].sort((a, b) => b[1] - a[1]))
  for (const [key, value] of sortedTargets) {
    str += `${key}: ${value} `
  }
  return str
}
</script>

<template>
  <span :title="showTargets(props.value)">{{ showTargets(props.value) }}</span>
</template>
