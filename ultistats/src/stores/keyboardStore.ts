import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onKeyStroke, onKeyUp } from '@vueuse/core'
import { KeyboardConstants } from '@/types/keyConstants'
import type { ShortcutTarget } from '@/components/interfaces/ShortcutTarget'

export const useKeyboardStore = defineStore('keyboard', () => {
  type KeyCombo = {
    key: string
    modifiers: Set<string>
  }
  const keyBindings = ref<Map<string, string>>(new Map())
  const keyBindingsUP = ref<Map<string, ShortcutTarget>>(new Map())
  const shortcutTargetsNames = ref<Map<string, ShortcutTarget>>(new Map())

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

  function registerShortcutTarget(name: string, target: ShortcutTarget) {
    if (shortcutTargetsNames.value.has(name)) {
      console.log(name + ' already present', shortcutTargetsNames.value.get(name))
      return false
    }
    shortcutTargetsNames.value.set(name, target)
    return true
  }

  function getKeyBinding(keyCode: string): string | undefined {
    return keyBindings.value.get(keyCode)
  }

  function addKeyBinding(keyCode: string, name: string) {
    if (keyBindings.value.has(keyCode)) {
      console.log(keyCode + ' already assigned', keyBindings.value.get(keyCode))
      return false
    }
    keyBindings.value.set(keyCode, shortcutTargetsNames.value.get(name)!)
    return true
  }

  function addKeyBindingUP(keycode: string, name: string) {
    if (keyBindingsUP.value.has(keycode)) {
      console.log(keycode + ' already present', keyBindingsUP.value.get(keycode))
      return false
    }
    keyBindingsUP.value.set(keycode, shortcutTargetsNames.value.get(name)!)
    return true
  }

  function removeKeyBinding(keyCode: string) {
    keyBindings.value.get(keyCode)?.removeShortcut(keyCode)
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
    if (modifierKeys.includes(code)) {
      activeModifiers.add(code)
      return
    }
    if (keyBindings.value.has(code)) {
      event.preventDefault()

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
    registerShortcutTarget,
    activeModifiers,
    userSpecialModifiers,
  }
})
