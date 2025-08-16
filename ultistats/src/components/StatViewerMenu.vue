<script setup lang="ts">
import { useStateStore } from '../stores/StateStore.ts'

const stateStore = useStateStore()
function onChangedScope(event: Event) {
  stateStore.statsScope = parseInt((event.target as HTMLSelectElement).value)
}
</script>
<template>
  <select @change="onChangedScope($event)">
    <option value="0">Current point</option>
    <option value="1">Up to current</option>
    <option value="2">All</option>
  </select>
</template>
