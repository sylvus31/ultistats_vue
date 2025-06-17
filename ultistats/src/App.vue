<script setup lang="ts">
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
// Import the Shoelace dark theme
import '@shoelace-style/shoelace/dist/themes/dark.css'

import '@shoelace-style/shoelace/dist/components/details/details.js'
import VideoPlayer, { type VideoPlayerInstance } from './components/VideoPlayer.vue'
import { ref } from 'vue'
import PlayerSelector from './components/PlayerSelector.vue'
import WindowHolder from './components/WindowHolder.vue'
import YoutubeVideoSelector from './components/YoutubeVideoSelector.vue'
import PassesSelector from './components/PassesSelector.vue'

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
const handleLoadYoutubeVideo = (source: { src: string; type: string }) => {
  console.log('App.vue received load-video event:', source)
  if (videoPlayerRef.value) {
    videoPlayerRef.value.loadVideo(source)
  } else {
    console.error('Video player ref not available when trying to load YouTube video.')
  }
}
</script>

<!-- Apply the Shoelace dark theme class -->
<template class="sl-theme-dark">
  <div class="input-container">
    <!-- Hidden file input -->
    <input
      type="file"
      ref="fileInputRef"
      @change="handleFileChange"
      accept="video/*"
      style="display: none"
    />

    <sl-button @click="openFileDialog">Load Video</sl-button>

    <YoutubeVideoSelector @load-video="handleLoadYoutubeVideo" />
  </div>
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
      <WindowHolder title="Passes"><PassesSelector /></WindowHolder>
      <WindowHolder title="Stats"/>
    </div>
  </sl-split-panel>
</template>

<style>
/* Apply Shoelace dark theme and global dark styles */
body {
  background-color: #1a1a1a; /* Dark background */
  color: #e0e0e0; /* Light text */
  margin: 0; /* Remove default body margin */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern font stack */
}

/* Ensure Shoelace components use the dark theme */
:root,
.sl-theme-dark {
  color-scheme: dark;
  /* You can override Shoelace variables here if needed */
  /* --sl-color-primary-600: #00bcd4; */ /* Example: Teal accent */
}

/* Style the split panel handle */
sl-split-panel::part(divider) {
  background-color: #333;
}

sl-split-panel::part(divider):hover {
  background-color: #2a4a52;
}

sl-button.active::part(base) {
  border: 2px solid #00bcd4; /* Techy teal accent for active */
  background-color: #2a4a52; /* Darker teal background for active */
  color: #fff; /* White text for active */
}

sl-button::part(base) {
  margin: 5px;
  padding: 5px 10px;
  min-width: 100px;
  background-color: #333; /* Dark background */
  color: #e0e0e0; /* Light text */
  text-align: center;
  border-radius: 5px;
  border: 2px solid #444; /* Darker border */
  cursor: pointer;
}
sl-button:hover:not(.active)::part(base) {
  background-color: #444; /* Slightly lighter on hover */
}

/* Add some padding around the app */
#app {
  /* Assuming your root element has id="app" in index.html or main.ts */
  padding: 1rem;
}
.input-container {
  display: flex;
  align-items: center; /* Vertically align items */
  gap: 20px; /* Add more space between button and input */
  margin-bottom: 10px; /* Add some space below the container */
}

/* Apply specific padding to align start panel content with button above */
sl-split-panel > div[slot='start'] {
  padding: 10px 10px 10px 5px; /* Match button left margin (5px) */
}
sl-split-panel > div[slot='end'] {
  padding: 10px;
}
</style>
