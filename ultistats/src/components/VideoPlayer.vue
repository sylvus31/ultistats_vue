<template>
  <!-- Add a ref to the root div -->
  <div ref="playerWrapper" tabindex="0">
    <!-- Video Element -->
    <video ref="videoNode" class="video-js vjs-default-skin"></video>

    <!-- Custom Controls -->
    <div class="custom-controls">
      <button @click="playPause">
        <span class="mdi" :class="isPlaying ? 'mdi-pause' : 'mdi-play'"></span> [SPACE]
      </button>
      <button @click="seek(-2)"><span class="mdi" :class="'mdi-rewind'"></span> 2s [←]</button>
      <button @click="seek(5)"><span class="mdi" :class="'mdi-fast-forward'"></span> 5s [→]</button>
      <button @click="changeSpeed(false)">
        <span class="mdi" :class="'mdi-play-speed'"></span> [↓]
      </button>
      <button @click="changeSpeed(true)">
        <span class="mdi" :class="'mdi-play-speed'"></span> [↑]
      </button>
      <span>Speed: {{ currentSpeed?.toFixed(2) }}x</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import 'videojs-youtube'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'
import { onKeyStroke } from '@vueuse/core'
import { useKeyboardStore } from '../stores/keyboardStore'

const keyboardStore = useKeyboardStore()

const videoPlayerKeys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
// --- Props ---
interface Props {
  options?: object
}

const frameDuration = 1 / 30

// Modify default options to include YouTube tech
const props = withDefaults(defineProps<Props>(), {
  options: () => ({
    autoplay: false,
    controls: true,
    preload: 'auto',
    fluid: true,
    disablePictureInPicture: true,
    enableSmoothSeeking: true,
    inactivityTimeout: 0,
    playbackRates: [0, 0.1, 0.25, 0.5, 1, 1.5, 2, 4],
    playsinline: true,
    controlBar: {
      fullscreenToggle: false,
    },
    userActions: {
      click: function (event: Event) {
        console.log('player clicked', event)
      },
      doubleClick: false,
      hotkeys: false,
    },
    techOrder: ['html5', 'youtube'],
  }),
})

// --- Refs ---
const videoNode = ref<HTMLVideoElement | null>(null)
const player = ref<Player | null>(null)
const isPlaying = ref(false)
const currentSpeed = ref<number | undefined>(1.0)
const playerWrapper = ref<HTMLDivElement | null>(null)

// --- Lifecycle Hooks ---
onMounted(() => {
  if (videoNode.value) {
    console.log('Initializing video player')
    player.value = videojs(videoNode.value, props.options, () => {
      console.log('Video player is ready')
      if (player.value) {
        isPlaying.value = !player.value.paused()
        currentSpeed.value = player.value.playbackRate()

        player.value.on('play', () => {
          isPlaying.value = true
        })
        player.value.on('pause', () => {
          isPlaying.value = false
        })
        player.value.on('ratechange', () => {
          if (player.value) {
            currentSpeed.value = player.value.playbackRate()
          }
        })
      }
    })
  } else {
    console.error('Video element not found for Video.js initialization.')
  }
})

onBeforeUnmount(() => {
  if (player.value) {
    console.log('Disposing video player')
    player.value.dispose()
    player.value = null
  }
})

// --- Control Methods ---
// playPause, seek, changeSpeed remain the same...
const playPause = () => {
  if (!player.value) return
  if (player.value.paused()) {
    player.value.play()
  } else {
    player.value.pause()
  }
}

const seek = (seconds: number) => {
  if (!player.value) return
  const currentTime = player.value.currentTime() || 0
  // Adjust seek logic if needed for YouTube, but standard seek should work
  if (!isPlaying.value || player.value.playbackRate() == 0) {
    const direction = seconds > 0 ? 1 : -1
    // Frame-by-frame might not work reliably with YouTube tech
    // Consider simplifying or adjusting this logic if issues arise
    player.value.currentTime(currentTime + frameDuration * direction)
  } else {
    player.value.currentTime(currentTime + seconds)
  }
}

const changeSpeed = (up: boolean) => {
  if (!player.value) return
  // Note: YouTube playback speed support might differ from local files
  const currentRate = player.value.playbackRate()
  const possibleRates: number[] = player.value.playbackRates() // Ensure type is number[]
  const currentIndex = currentRate ? possibleRates.indexOf(currentRate) : 1.0

  let newRate = 1
  if (currentIndex !== -1) {
    // Check if currentRate is found
    const shift = up ? 1 : -1
    const newIndex = Math.max(0, Math.min(possibleRates.length - 1, currentIndex + shift))
    newRate = possibleRates[newIndex]
  } else {
    console.warn(
      'Current playback rate not found in available rates. Setting to 1.',
      currentRate,
      possibleRates,
    )
    // Find the closest rate or default to 1
    newRate = 1.0
  }
  player.value.playbackRate(newRate)
}

const loadVideo = (source: { src: string; type: string }) => {
  if (player.value) {
    console.log('Loading new video source:', source)
    player.value.src(source)
  } else {
    console.error('Video player not available to load new source.')
  }
}

// --- Keyboard Shortcuts ---
onKeyStroke(true, (event: KeyboardEvent) => {
  console.log(keyboardStore.onFocusOnly)
  if (keyboardStore.onFocusOnly) {
    return
  }
  event.preventDefault()
  if (videoPlayerKeys.includes(event.key)) {
    switch (event.key) {
      case 'ArrowUp':
        changeSpeed(true)
        break
      case 'ArrowDown':
        changeSpeed(false)
        break
      case 'ArrowLeft':
        seek(-2)
        break
      case 'ArrowRight':
        seek(5)
        break
      case ' ':
        playPause()
        break
      default:
        break
    }
  }
})

export interface VideoPlayerInstance {
  playPause: () => void
  isPlaying: typeof isPlaying
  seek: (seconds: number) => void
  changeSpeed: (up: boolean) => void
  currentSpeed: typeof currentSpeed
  loadVideo: (source: { src: string; type: string }) => void
}

defineExpose({
  playPause,
  isPlaying,
  seek,
  changeSpeed,
  currentSpeed,
  loadVideo,
})
</script>

<style scoped>
[tabindex='0']:focus {
  outline: 2px solid dodgerblue; /* Or your preferred focus style */
  outline-offset: 2px;
}
.custom-controls {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.custom-controls button {
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 3px;
}
.custom-controls span {
  font-family: sans-serif;
  font-size: 0.9em;
  margin-left: 5px;
}
</style>
