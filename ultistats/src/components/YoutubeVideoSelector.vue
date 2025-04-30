<template>
  <sl-button @click="triggerLoadVideo">Open</sl-button>
  <input
    ref="youtubeInputRef"
    class="borderless-input"
    type="search"
    list="browsers"
    name="myBrowser"
    id="youtubeInput"
    placeholder="https://www.youtube.com/..."
    @focusin="handleGetFocus"
    @focusout="handleLosseFocus"
  />
  <datalist id="browsers">
    <option value="Finale Indoor"></option>
    <option value="Demi finale indoor"></option>
  </datalist>
</template>

<script setup lang="ts">
import { ref } from 'vue' // Import ref
import { useKeyboardStore } from '../stores/keyboardStore'

const keyboardStore = useKeyboardStore()
const youtubeInputRef = ref<HTMLInputElement | null>(null) // Ref for the input

// Define the event the component can emit
const emit = defineEmits<{
  (e: 'load-video', source: { src: string; type: string }): void
}>()

const sources = new Map<string, string>()
sources.set('Finale Indoor', 'https://www.youtube.com/watch?v=uPnYUndwops')
sources.set('Demi finale indoor', 'https://www.youtube.com/watch?v=rpxHv1Nf8aY')

// Renamed function to be more descriptive
const triggerLoadVideo = () => {
  const inputVal = youtubeInputRef.value?.value // Get value using ref
  if (inputVal) {
    let url: string | undefined

    if (sources.has(inputVal)) {
      url = sources.get(inputVal)
    } else if (inputVal.startsWith('https://www.youtube.com/watch?v=')) {
      // Basic check if it looks like a direct YouTube URL
      url = inputVal
    }

    if (url) {
      console.log('Emitting load-video event with URL:', url)
      // Emit the event with the source object expected by VideoPlayer
      emit('load-video', {
        src: url,
        type: 'video/youtube', // Specify the type for videojs-youtube
      })
    } else {
      console.warn('Invalid input or URL not found for:', inputVal)
      // Maybe provide user feedback here
    }
  }
}

const handleGetFocus = () => {
  keyboardStore.setOnFocusOnly(true)
}

const handleLosseFocus = () => {
  keyboardStore.setOnFocusOnly(false)
}
</script>

<style scoped>
.borderless-input {
  border: none;
  outline: none;
  /* background-color: transparent; */
  /* padding: 5px; */
}
/* Add focus style for accessibility */
.borderless-input:focus {
  background-color: #eee;
}
</style>
