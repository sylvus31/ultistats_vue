export interface ShortcutTarget {
  message: (key: string, modifiers: Set<string>) => string
  callback: (key: string, modifiers: Set<string>) => void
  setShortcut: (key: string) => void
  removeShortcut: (key: string) => void
}

export const playersSelectorShortcutManagerName: string = 'playersSelectorShortcutManager'
export const passesSelectorShortcutManagerName: string = 'passesSelectorShortcutManager'
