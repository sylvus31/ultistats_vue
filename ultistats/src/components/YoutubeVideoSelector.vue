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
      class="input-base input-medium"
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
import { storeToRefs } from 'pinia'

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
  keyboardStore.forbidShortcuts()
}

const handleLosseFocus = () => {
  keyboardStore.allowShortcuts()
}

onMounted(() => {
  const initStore = useInitStore()
  const { videoSrc } = storeToRefs(initStore)
  watch(videoSrc, () => {
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
/* No component-specific styles needed - using global input-base and input-medium classes */
</style>
