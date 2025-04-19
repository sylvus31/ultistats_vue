<script setup lang="ts">
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/details/details.js'
import VideoPlayer, { type VideoPlayerInstance } from './components/VideoPlayer.vue'
import { onKeyStroke, useFocus } from '@vueuse/core'
import { ref } from 'vue'

const videoPlayerRef = ref<VideoPlayerInstance | null>(null)
const videoPlayerKeys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
onKeyStroke(true, (event: KeyboardEvent) => {
  event.preventDefault()
  if (videoPlayerKeys.includes(event.key)) {
    if (videoPlayerRef.value) {
      switch (event.key) {
        case 'ArrowUp':
          videoPlayerRef.value.changeSpeed(true)
          break
        case 'ArrowDown':
          videoPlayerRef.value.changeSpeed(false)
          break
        case 'ArrowLeft':
          videoPlayerRef.value.seek(-2)
          break
        case 'ArrowRight':
          videoPlayerRef.value.seek(5)
          break
        case ' ':
          videoPlayerRef.value.playPause()
          break
        default:
          break
      }
    }
  }
})
</script>

<template>
  yoh
  <sl-button>Button</sl-button>
  <sl-button>Button</sl-button>
  <!-- eslint-disable vue/no-deprecated-slot-attribute -->
  <!-- prettier-ignore -->
  <sl-split-panel>
    <div slot="start" >
      <VideoPlayer ref="videoPlayerRef" />
    </div>
    <div slot="end">
      <sl-details summary="Toggle Me">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
<sl-details summary="Toggle Me">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
<sl-details summary="Toggle Me">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
    </div>
  </sl-split-panel>
</template>

<style></style>
