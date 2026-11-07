<script setup lang="ts">
const props = defineProps<{
  value: Map<string, number>
  playerColors?: Map<string, string | undefined>
}>()
const sortedTargets = () => [...props.value.entries()].sort((a, b) => b[1] - a[1])
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
  <span :title="showTargets(props.value)">
    <template v-for="([name, count], index) in sortedTargets()" :key="name">
      <span
        v-if="playerColors?.has(name)"
        class="player-name"
        :style="{ textDecorationColor: playerColors.get(name) }"
        >{{ name }}</span
      >
      <span v-else>{{ name }}</span
      >: {{ count }}{{ index < props.value.size - 1 ? ' ' : '' }}
    </template>
  </span>
</template>

<style scoped>
.player-name {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
