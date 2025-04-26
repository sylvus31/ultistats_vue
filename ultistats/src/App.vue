<script setup lang="ts">
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/details/details.js'
// Make sure the path and type import are correct
import VideoPlayer, { type VideoPlayerInstance } from './components/VideoPlayer.vue'
import { ref } from 'vue'
import BetterButtonContainer from './components/WindowHolder.vue'
import PlayerSelector from './components/PlayerSelector.vue'
import Window from './components/WindowHolder.vue'
import WindowHolder from './components/WindowHolder.vue'

const videoPlayerRef = ref<VideoPlayerInstance | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null) // Ref for the hidden file input

// Method to trigger the hidden file input
const openFileDialog = () => {
  fileInputRef.value?.click()
}

// Method to handle the file selection
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && videoPlayerRef.value) {
    // Create an object URL for the selected file
    const source = {
      src: URL.createObjectURL(file),
      type: file.type, // Get the MIME type from the file
    }
    console.log('File selected:', file.name, 'Type:', file.type)

    // Call the loadVideo method on the VideoPlayer component instance
    videoPlayerRef.value.loadVideo(source)

    // Optional: Revoke the object URL when it's no longer needed.
    // Video.js might handle this, but explicit cleanup can be safer.
    // You might revoke it in onBeforeUnmount or when loading a *new* video.
    // For simplicity, we'll omit explicit revocation here, but keep it in mind.
    // URL.revokeObjectURL(source.src);

    // Reset the input value so the change event fires even if the same file is selected again
    target.value = ''
  } else if (!file) {
    console.log('No file selected.')
  } else {
    console.error('Video player ref not available.')
  }
}
</script>

<template>
  <!-- Hidden file input -->
  <input
    type="file"
    ref="fileInputRef"
    @change="handleFileChange"
    accept="video/*"
    style="display: none"
  />

  <!-- Button to open the file dialog -->
  <sl-button @click="openFileDialog">Load Video</sl-button>

  <sl-button>Button</sl-button>
  <!-- Existing button -->

  <!-- eslint-disable vue/no-deprecated-slot-attribute -->
  <!-- prettier-ignore -->
  <sl-split-panel>
    <div slot="start" >
      <!-- Make sure the ref is correctly assigned -->
      <VideoPlayer ref="videoPlayerRef" />
    </div>
    <div slot="end">
      <WindowHolder title="Players">
        <PlayerSelector/>
      </WindowHolder>
      <WindowHolder title="Actions"/>
      <WindowHolder title="Stats"/>
    </div>
  </sl-split-panel>
</template>

<style>
/* Add any global styles if needed */
</style>
