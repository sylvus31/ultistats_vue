import { defineStore } from 'pinia'

export const useInitStore = defineStore('init', {
  state: () => ({
    records: [] as Array<any>,
    videoSrc:{ type: '', uri: '' },
    teams: [] as Array<any>,
  }),
  actions: {
    setFile(fileName: string) {
       fetch(`${window.location.origin}/save/${fileName}`)
      .then((response) => response.json())
      .then((jsonData) => {
        const jsonDataIsObject = typeof jsonData === 'object' && jsonData !== null
        const hasVersionProperty = jsonDataIsObject && 'version' in jsonData
        if (hasVersionProperty) {
          this.records = jsonData.records
          this.videoSrc = jsonData.videoSrc
          this.teams = jsonData.teams
        }
      })
    },
    isYoutubeVideo() {
      return this.videoSrc.type === 'youtube'
    },
    getVideoUri() {
      return this.videoSrc.uri
    }

  },
})
