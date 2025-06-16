import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onKeyStroke, onKeyUp } from '@vueuse/core'

export const useKeyboardStore = defineStore('keyboard', () => {
  const keyBindings = ref<Map<string, KeyBinding>>(new Map())

  type keyBindingCallback = (event: KeyboardEvent, modifiers: Set<string>) => void
  class KeyBinding {
    msg: string
    callback: keyBindingCallback
    component: string
    modifiers: string[]

    constructor(component: string, msg: string, modifiers: string[], callback: keyBindingCallback) {
      this.msg = msg
      this.callback = callback
      this.component = component
      this.modifiers = modifiers
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
    modifiers: string[],
    callback: (event: KeyboardEvent, modifiers: Set<string>) => void,
  ) {
    if (keyBindings.value.has(keycode)) {
      console.log(keycode + ' already present', keyBindings.value.get(keycode))
      return false
    }
    console.log('setting: ', keycode)
    keyBindings.value.set(keycode, new KeyBinding(comp, msg, modifiers, callback))
    return true
  }

  function removeKeyBinding(keyCode: string) {
    keyBindings.value.delete(keyCode)
  }

  const modifierKeys: string[] = ['NumpadEnter'] //['ControlRight', 'ShiftRight', 'ShiftLeft'] // AltxxKey
  const forbiddenKeys = ['MetaLeft', 'MetaRight', 'NumLock']
  const activeModifiers: Set<string> = new Set()
  const shift = 'SHIFT'
  const alt = 'ALT'
  const control = 'CONTROL'
  const userSpecialModifiers = [shift, control]

  onKeyStroke((event) => {
    // Ignore repeated key presses when the key is held down
    if (event.repeat) {
      return
    }
    console.log('onKeyStroke: event', event)

    if (modifierKeys.includes(event.code)) {
      activeModifiers.add(event.code)
      return
    }
    //special keys
    if (keyBindings.value.has(event.code)) {
      if (
        focusHolderid === defaultFocusCompId ||
        focusHolderid === keyBindings.value.get(event.code)!.component
      ) {
        const specialModifiers = addModifiersForSpecialKeys(event)
        const tmpModifiers = new Set([...activeModifiers, ...specialModifiers])
        keyBindings.value.get(event.code)!.callback(event, tmpModifiers)
        console.log('onKeyStroke: tmpModifiers', tmpModifiers)
      } else {
        console.log(
          keyBindings.value.get(event.code)!.component + ' does not match ' + focusHolderid,
        )
      }
    } else {
      console.log('no binding for', event.code)
    }
  })

  onKeyUp(true, (event) => {
    event.preventDefault()

    //no need to check if it a modifier or not
    activeModifiers.delete(event.code)
    console.log('up', activeModifiers)
  })
  function addModifiersForSpecialKeys(event: KeyboardEvent): Set<string> {
    const tmpModifiers = new Set<string>()
    if (event.shiftKey && userSpecialModifiers.includes(shift)) {
      tmpModifiers.add(shift)
    }
    if (event.altKey && userSpecialModifiers.includes(alt)) {
      tmpModifiers.add(alt)
    }
    if (event.ctrlKey && userSpecialModifiers.includes(control)) {
      tmpModifiers.add(control)
    }
    return tmpModifiers
  }

  return { requestFocus, freeFocus, addKeyBinding, removeKeyBinding, activeModifiers }
})
