<template>
  <div class="input-container">
    <sl-button @click="triggerLoadVideo">Open</sl-button>
    <!-- Use standard HTML input for datalist support -->
    <input
      ref="youtubeInputRef"
      id="youtubeInput"
      type="text"
      placeholder="https://www.youtube.com/..."
      @focusin="handleGetFocus"
      @focusout="handleLosseFocus"
      list="ytVideosList"
      class="styled-input"
    />
    <datalist id="ytVideosList">
      <option value="Finale Indoor"></option>
      <option value="Demi finale indoor"></option>
    </datalist>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue' // Import ref
import { useKeyboardStore } from '../stores/keyboardStore'
import { useInitStore } from '@/stores/init'
const componentId = 'YTvideoSelector'

const keyboardStore = useKeyboardStore()
const youtubeInputRef = ref<HTMLInputElement | null>(null) // Ref for the HTML input

// Define the event the component can emit
const emit = defineEmits<{
  (e: 'load-video', source: { src: string; type: string }): void
}>()

const sources = new Map<string, string>()
sources.set('Finale Indoor', 'https://www.youtube.com/watch?v=uPnYUndwops')
sources.set('Demi finale indoor', 'https://www.youtube.com/watch?v=rpxHv1Nf8aY')

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
  keyboardStore.requestFocus(componentId)
}

const handleLosseFocus = () => {
  keyboardStore.freeFocus()
}

onMounted(() => {
  const initStore = useInitStore()
  const initReady = ref(initStore.isReady())
  watch(initReady, () => {
    if (initStore.isYoutubeVideo()) {
      if (youtubeInputRef.value) {
        youtubeInputRef.value.value = initStore.getVideoUri()
      }
      triggerLoadVideo()
    }
  })
})
</script>

<style scoped>
.styled-input {
  /* Base styling */
  font-family: inherit; /* Inherit font from body */
  font-size: inherit;
  line-height: inherit;
  border: 2px solid #444; /* Match button border */
  border-radius: 5px; /* Match button radius */
  background-color: #333; /* Match button background */
  color: #e0e0e0; /* Match button text color */
  padding: 5px 10px; /* Match button padding */
  margin: 5px; /* Match button margin */
  min-width: 100px; /* Match button min-width */
  width: 300px; /* Specific width */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  height: 38px; /* Explicit height to match button - Adjust if needed */
}

.styled-input:focus {
  border-color: #00bcd4; /* Accent color on focus */
  outline: none; /* Remove default browser outline */
}

.input-container {
  gap: 10px; /* Add some space between button and input */
  margin-bottom: 0px;
}
</style>
