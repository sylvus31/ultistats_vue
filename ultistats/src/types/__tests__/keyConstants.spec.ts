import { describe, expect, it } from 'vitest'
import {
  formatShortcutKey,
  getKeyboardShortcutKey,
  isReservedShortcutKey,
  normalizeShortcutKey,
  transformCodeForSpecialKeys,
} from '../keyConstants'

describe('keyboard shortcut keys', () => {
  it('converts legacy letter codes into layout-independent characters', () => {
    expect(normalizeShortcutKey('KeyZ')).toBe('z')
    expect(normalizeShortcutKey('W')).toBe('w')
  })

  it('uses the typed letter regardless of Shift or keyboard layout', () => {
    expect(getKeyboardShortcutKey({ code: 'KeyZ', key: 'w' })).toBe('w')
    expect(getKeyboardShortcutKey({ code: 'KeyZ', key: 'W' })).toBe('w')
  })

  it('uses typed punctuation instead of its physical key code', () => {
    expect(getKeyboardShortcutKey({ code: 'Period', key: ':' })).toBe(':')
    expect(formatShortcutKey(getKeyboardShortcutKey({ code: 'Period', key: ':' }))).toBe(':')
  })

  it('keeps special keys and modifiers identified by their physical code', () => {
    expect(getKeyboardShortcutKey({ code: 'NumpadEnter', key: 'Enter' })).toBe('NumpadEnter')
    expect(transformCodeForSpecialKeys('ShiftLeft')).toBe('Shift')
    expect(transformCodeForSpecialKeys('ControlRight')).toBe('Ctrl')
  })

  it('reserves Space and all arrow keys for video controls', () => {
    expect(isReservedShortcutKey('Space')).toBe(true)
    expect(isReservedShortcutKey('ArrowUp')).toBe(true)
    expect(isReservedShortcutKey('ArrowDown')).toBe(true)
    expect(isReservedShortcutKey('ArrowLeft')).toBe(true)
    expect(isReservedShortcutKey('ArrowRight')).toBe(true)
    expect(isReservedShortcutKey('Period')).toBe(false)
  })

  it('formats letter shortcuts in uppercase, including legacy values', () => {
    expect(formatShortcutKey('w')).toBe('W')
    expect(formatShortcutKey('KeyZ')).toBe('Z')
  })
})
