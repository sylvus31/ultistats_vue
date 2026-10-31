import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePassesStore } from '../passesStore'

describe('default passes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          passes: [{ id: 'a6', name: 'Hammer', isActive: false, key: 'q' }],
          passesModifiers: [{ id: 'pm1', name: 'longue', isActive: false, key: 'Shift' }],
        }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads the pass list and modifiers from the defaults file', async () => {
    const passesStore = usePassesStore()
    await vi.waitFor(() => expect(passesStore.passes[0]?.name).toBe('Hammer'))

    expect(passesStore.passesModifiers[0]?.name).toBe('longue')
    expect(fetch).toHaveBeenCalledWith('/passes.json')
  })
})
