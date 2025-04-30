import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useKeyboardStore = defineStore('keyboard', () => {
  const onFocusOnly = ref<boolean>(false)
  function setOnFocusOnly(value: boolean) {
    onFocusOnly.value = value
  }

  return { onFocusOnly, setOnFocusOnly }
})
