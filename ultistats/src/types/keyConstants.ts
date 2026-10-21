export enum KeyboardConstants {
  SHIFT = 'Shift',
  CTRL = 'Ctrl',
  ALT = 'Alt',
}

export function normalizeShortcutKey(key: string): string {
  const legacyLetterCode = /^Key([A-Z])$/.exec(key)
  if (legacyLetterCode) {
    return legacyLetterCode[1].toLowerCase()
  }
  return key.length === 1 ? key.toLowerCase() : key
}

export function transformCodeForSpecialKeys(code: string): string {
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

export function getKeyboardShortcutKey(event: Pick<KeyboardEvent, 'code' | 'key'>): string {
  if (/^Key[A-Z]$/.test(event.code)) {
    return normalizeShortcutKey(event.key.length === 1 ? event.key : event.code)
  }
  return transformCodeForSpecialKeys(event.code)
}

export function formatShortcutKey(key?: string): string {
  if (!key) {
    return ''
  }
  const normalizedKey = normalizeShortcutKey(key)
  return normalizedKey.length === 1 ? normalizedKey.toUpperCase() : normalizedKey
}
