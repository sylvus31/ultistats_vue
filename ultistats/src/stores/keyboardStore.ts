import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onKeyStroke, onKeyUp } from '@vueuse/core'
import { KeyboardConstants } from '@/types/keyConstants'

export const useKeyboardStore = defineStore('keyboard', () => {
  const keyBindings = ref<Map<string, KeyBinding>>(new Map())
  const keyBindingsUP = ref<Map<string, KeyBinding>>(new Map())

  type keyBindingCallback = (eventCode: string, modifiers: Set<string>) => void
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
  let shortcutAllowed = true
  function updateShortcutsAllowance(status: boolean) {
    shortcutAllowed = status
    console.log('shortcuts: ', shortcutAllowed)
  }
  function forbidShortcuts() {
    updateShortcutsAllowance(false)
  }

  function allowShortcuts() {
    updateShortcutsAllowance(true)
  }

  function getKeyBinding(keyCode: string): KeyBinding | undefined {
    return keyBindings.value.get(keyCode)
  }

  function addKeyBinding(comp: string, keycode: string, msg: string, callback: keyBindingCallback) {
    if (keyBindings.value.has(keycode)) {
      console.log(keycode + ' already present', keyBindings.value.get(keycode))
      return false
    }
    keyBindings.value.set(keycode, new KeyBinding(comp, msg, callback))
    return true
  }

  function addKeyBindingUP(
    comp: string,
    keycode: string,
    msg: string,
    callback: keyBindingCallback,
  ) {
    if (keyBindingsUP.value.has(keycode)) {
      console.log(keycode + ' already present', keyBindings.value.get(keycode))
      return false
    }
    keyBindingsUP.value.set(keycode, new KeyBinding(comp, msg, callback))
    return true
  }

  function removeKeyBinding(keyCode: string) {
    keyBindings.value.delete(keyCode)
  }

  function removeKeyBindingUP(keyCode: string) {
    keyBindingsUP.value.delete(keyCode)
  }

  const modifierKeys: string[] = ['NumpadEnter', KeyboardConstants.SHIFT, KeyboardConstants.CTRL] //['ControlRight', 'ShiftRight', 'ShiftLeft'] // AltxxKey
  // const forbiddenKeys = ['MetaLeft', 'MetaRight', 'NumLock']
  const activeModifiers: Set<string> = new Set()

  const userSpecialModifiers = [KeyboardConstants.SHIFT, KeyboardConstants.CTRL]

  onKeyStroke((event) => {
    // Ignore repeated key presses when the key is held down
    if (event.repeat || !shortcutAllowed) {
      console.log('repeat or allowed', event.repeat, shortcutAllowed)
      return
    }

    console.log('onKeyStroke: event', event)
    const code = transformCodeForSpecialKeys(event.code)

    if (keyBindings.value.has(code)) {
      event.preventDefault()
      if (modifierKeys.includes(code)) {
        activeModifiers.add(code)
      }
      keyBindings.value.get(code)!.callback(code, activeModifiers)
      console.log('onKeyStroke: activeModifiers', activeModifiers)
    } else {
      console.log('no binding for', event.code)
    }
  })

  onKeyUp(true, (event) => {
    event.preventDefault()

    //no need to check if it a modifier or not
    const code = transformCodeForSpecialKeys(event.code)
    activeModifiers.delete(code)
    keyBindingsUP.value.get(code)?.callback(code, activeModifiers)
    console.log('up', activeModifiers)
  })

  function transformCodeForSpecialKeys(code: string): string {
    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      return KeyboardConstants.SHIFT
    }
    if (code === 'AltLeft' || code === 'AltRight') {
      return KeyboardConstants.ALT
    }
    if (code === 'ControlLeft' || code === 'ControlRight') {
      return KeyboardConstants.CTRL
    }
    return code
  }

  return {
    forbidShortcuts,
    allowShortcuts,
    addKeyBinding,
    addKeyBindingUP,
    removeKeyBinding,
    removeKeyBindingUP,
    getKeyBinding,
    activeModifiers,
    userSpecialModifiers,
  }
})
