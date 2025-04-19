<template>
  <!-- Add a ref to the root div -->
  <div ref="playerWrapper" tabindex="0">
    <!-- Video Element -->
    <video ref="videoNode" class="video-js vjs-default-skin"></video>

    <!-- Custom Controls -->
    <div class="custom-controls">
      <button @click="playPause">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <button @click="seek(-2)">&lt;&lt; 2s [←]</button>
      <button @click="seek(5)">&gt;&gt; 5s [→]</button>
      <button @click="changeSpeed(false)">Speed down [↓]</button>
      <button @click="changeSpeed(true)">Speed Up [↑]</button>
      <span>Speed: {{ currentSpeed.toFixed(2) }}x</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue' // Removed computed as it wasn't used directly
import videojs, { type VideoJsPlayer, type VideoJsPlayerOptions } from 'video.js'
import 'video.js/dist/video-js.css'

// --- Props ---
interface Props {
  options?: VideoJsPlayerOptions
}

const frameDuration = 1 / 30

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
      // Keep click handler if needed, but disable default spacebar hotkey if video.js has one
      click: function (event: Event) {
        console.log('player clicked', event)
        // Optionally toggle play/pause on click as well
        // playPause();
      },
      doubleClick: false, // Keep double click disabled if desired
      hotkeys: false,
    },
    sources: [
      {
        src: 'https://files.vidstack.io/sprite-fight/480p.mp4',
        type: 'video/mp4',
      },
    ],
  }),
})

// --- Refs ---
const videoNode = ref<HTMLVideoElement | null>(null)
const player = ref<VideoJsPlayer | null>(null)
const isPlaying = ref(false)
const currentSpeed = ref(1.0)
const playerWrapper = ref<HTMLDivElement | null>(null) // Ref for the root div

// --- Lifecycle Hooks ---
onMounted(() => {
  // Initialize Video.js Player
  if (videoNode.value) {
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

        // Focus the wrapper initially if desired, so keydown works immediately
        // playerWrapper.value?.focus();
      }
    })
  } else {
    console.error('Video element not found for Video.js initialization.')
  }

  // Note: Keydown listener is now handled directly in the template
  // with @keydown.space.prevent="handleSpacebar"
})

onBeforeUnmount(() => {
  if (player.value) {
    console.log('Disposing video player')
    player.value.dispose()
    player.value = null
  }
  // No need to manually remove listener added via template directive
})

// --- Control Methods ---
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
  if (!isPlaying.value || player.value.playbackRate() == 0) {
    const direction = seconds > 0 ? 1 : -1
    player.value.currentTime(currentTime + frameDuration * direction)
  } else {
    player.value.currentTime(currentTime + seconds)
  }
}

const changeSpeed = (up: boolean) => {
  if (!player.value) return
  const currentRate = player.value.playbackRate()
  const possibleRates: [number] = player.value.playbackRates()
  const currentIndex = possibleRates.lastIndexOf(currentRate)
  let newRate = 1
  if (currentIndex >= 0) {
    const shift = up ? 1 : -1
    const newIndex = Math.max(0, Math.min(possibleRates.length - 1, currentIndex + shift))
    newRate = possibleRates[newIndex]
  } else {
    console.log('wrong playspeed', currentRate, possibleRates, 'set to 1')
  }
  player.value.playbackRate(newRate)
}

defineExpose({
  playPause,
  isPlaying, // Expose the ref directly
  seek,
  changeSpeed,
  currentSpeed, // Expose the ref directly
})
</script>

<style scoped>
/* Add focus outline for accessibility on the wrapper */
[tabindex='0']:focus {
  outline: 2px solid dodgerblue; /* Or your preferred focus style */
  outline-offset: 2px;
}

/* Add some basic styling for the controls */
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
