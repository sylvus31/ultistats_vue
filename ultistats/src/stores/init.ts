import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useInitStore = defineStore('init', () => {
  let records = []
  let videoSrc = {
    type: '',
    uri: '',
  }
  let teams = []

  const ready = ref(false)

  // initialization from saved file
  const params = new URLSearchParams(window.location.search)
  console.log('INIT STORE', 'Checking for file parameter in URL...')
  if (params.has('file')) {
    const fileName = params.get('file')
    fetch(`${window.location.origin}/save/${fileName}`)
      .then((response) => response.json())
      .then((jsonData) => {
        console.log('INIT STORE', 'File loaded from URL parameter')
        const jsonDataIsObject = typeof jsonData === 'object' && jsonData !== null
        const hasVersionProperty = jsonDataIsObject && 'version' in jsonData
        if (hasVersionProperty) {
          records = jsonData.records
          videoSrc = jsonData.videoSrc
          teams = jsonData.teams
        }
        ready.value = true
      })
  } else {
    ready.value = true
  }

  //getters
  const getRecords = () => records
  const getVideoSrc = () => videoSrc
  const getTeams = () => teams
  const hasRecords = () => records.length > 0
  const isYoutubeVideo = () => videoSrc.type === 'youtube'
  const isLocalVideo = () => videoSrc.type === 'local'
  const getVideoUri = () => videoSrc.uri
  const isReady = () =>
    computed(() => {
      return ready.value
    })
  return {
    getRecords,
    getVideoSrc,
    getTeams,
    hasRecords,
    isYoutubeVideo,
    isLocalVideo,
    getVideoUri,
    isReady,
  }
})
