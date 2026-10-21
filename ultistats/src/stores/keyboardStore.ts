import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onKeyStroke, onKeyUp } from '@vueuse/core'
import {
  getKeyboardShortcutKey,
  KeyboardConstants,
  normalizeShortcutKey,
  transformCodeForSpecialKeys,
} from '@/types/keyConstants'
import type { ShortcutTarget } from '@/components/interfaces/ShortcutTarget'

export const useKeyboardStore = defineStore('keyboard', () => {
  type KeyCombo = {
    key: string
    modifiers: Set<string>
  }
  const keyBindings = ref<Map<string, string>>(new Map())
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

  function getKeyBinding(keyCode: string): string {
    return keyBindings.value.get(normalizeShortcutKey(keyCode)) ?? ''
  }

  function addKeyBinding(keyCode: string, name: string) {
    const normalizedKey = normalizeShortcutKey(keyCode)
    if (keyBindings.value.has(normalizedKey)) {
      console.log(normalizedKey + ' already assigned', keyBindings.value.get(normalizedKey))
      return false
    }
    keyBindings.value.set(normalizedKey, name)
    return true
  }

  function addKeyBindingUP(
    comp: string,
    keycode: string,
    msg: string,
    callback: keyBindingCallback,
  ) {
    const normalizedKey = normalizeShortcutKey(keycode)
    if (keyBindingsUP.value.has(normalizedKey)) {
      console.log(normalizedKey + ' already assigned', keyBindingsUP.value.get(normalizedKey))
      return false
    }
    keyBindingsUP.value.set(normalizedKey, new KeyBinding(comp, msg, callback))
    return true
  }

  function removeKeyBinding(keyCode: string) {
    const normalizedKey = normalizeShortcutKey(keyCode)
    const targetName = keyBindings.value.get(normalizedKey)
    if (targetName) {
      shortcutTargetsNames.value.get(targetName)?.removeShortcut(normalizedKey)
    }
    keyBindings.value.delete(normalizedKey)
  }

  function removeKeyBindingUP(keyCode: string) {
    keyBindingsUP.value.delete(normalizeShortcutKey(keyCode))
  }

  function removeKeyBindingsFor(targetName: string) {
    for (const [key, name] of keyBindings.value) {
      if (name === targetName) {
        keyBindings.value.delete(key)
      }
    }
  }

  const modifierKeys: string[] = ['NumpadEnter', KeyboardConstants.SHIFT, KeyboardConstants.CTRL] //['ControlRight', 'ShiftRight', 'ShiftLeft'] // AltxxKey
  // const forbiddenKeys = ['MetaLeft', 'MetaRight', 'NumLock']
  const activeModifiers: Set<string> = new Set()

  const userSpecialModifiers = [KeyboardConstants.SHIFT, KeyboardConstants.CTRL]

  onKeyStroke((event) => {
    // Ignore repeated key presses when the key is held down
    if (event.repeat || !shortcutAllowed) {
      console.log('repeat / allowed', event.repeat, shortcutAllowed)
      return
    }

    console.log('onKeyStroke: event', event)
    const code = transformCodeForSpecialKeys(event.code)
    const key = getKeyboardShortcutKey(event)
    if (modifierKeys.includes(code)) {
      activeModifiers.add(code)
    }
    if (keyBindings.value.has(key)) {
      event.preventDefault()
      const targetName = keyBindings.value.get(key)!
      shortcutTargetsNames.value.get(targetName)?.callback(key, activeModifiers)
      console.log('onKeyStroke: activeModifiers', activeModifiers)
    } else {
      console.log('no binding for', key)
    }
  })

  onKeyUp(true, (event) => {
    event.preventDefault()

    //no need to check if it a modifier or not
    const code = transformCodeForSpecialKeys(event.code)
    activeModifiers.delete(code)
    console.log('up', activeModifiers)

    const key = getKeyboardShortcutKey(event)
    keyBindingsUP.value.get(key)?.callback(key, activeModifiers)
  })

  return {
    forbidShortcuts,
    allowShortcuts,
    addKeyBinding,
    addKeyBindingUP,
    removeKeyBinding,
    removeKeyBindingUP,
    removeKeyBindingsFor,
    getKeyBinding,
    registerShortcutTarget,
    activeModifiers,
    userSpecialModifiers,
  }
})
