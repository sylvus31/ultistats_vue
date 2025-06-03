import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onKeyStroke, onKeyUp } from '@vueuse/core'

export const useKeyboardStore = defineStore('keyboard', () => {
  const keyBindings = ref<Map<string, KeyBinding>>(new Map())

  type keyBindingCallback = (event: KeyboardEvent) => void
  class KeyBinding {
    msg: string
    callback: keyBindingCallback
    component: string

    constructor(component: string, msg: string, callback: keyBindingCallback) {
      this.msg = msg
      this.callback = callback
      this.component = component
    }
  }
  const defaultFocusCompId = ''
  let focusHolderid: string = defaultFocusCompId
  function updateFocus(component: string) {
    console.log('focus set from <' + focusHolderid + '> to <' + component + '>')
    focusHolderid = component
  }
  function requestFocus(component: string) {
    updateFocus(component)
  }

  function freeFocus() {
    updateFocus(defaultFocusCompId)
  }

  function addKeyBinding(
    comp: string,
    keycode: string,
    msg: string,
    callback: (event: KeyboardEvent) => void,
  ) {
    if (keyBindings.value.has(keycode)) {
      console.log(keycode + ' already present', keyBindings.value.get(keycode))
      return false
    }
    console.log('setting: ', keycode)
    keyBindings.value.set(keycode, new KeyBinding(comp, msg, callback))
    return true
  }

  function removeKeyBinding(keyCode: string) {
    keyBindings.value.delete(keyCode)
  }

  const modifierKeys = ['ControlRight', 'ShiftRight', 'ShiftLeft']
  let activeModifiers: string[] = []

  onKeyUp(true, (event: KeyboardEvent) => {
    console.log('up', event.code)
    activeModifiers = activeModifiers.filter((modifier) => modifier !== event.code)
    console.log(activeModifiers)
  })

  onKeyStroke((event) => {
    // Ignore repeated key presses when the key is held down
    if (event.repeat) {
      return
    }
    if (modifierKeys.includes(event.code)) {
      activeModifiers.push(event.code)
      console.log(activeModifiers)
      return
    }
    if (keyBindings.value.has(event.code)) {
      if (
        focusHolderid === defaultFocusCompId ||
        focusHolderid === keyBindings.value.get(event.code)!.component
      ) {
        keyBindings.value.get(event.code)!.callback(event)
      } else {
        console.log(
          keyBindings.value.get(event.code)!.component + ' does not match ' + focusHolderid,
        )
      }
    } else {
      console.log('no binding for', event.code)
    }
  })
  return { requestFocus, freeFocus, addKeyBinding, removeKeyBinding }
})
