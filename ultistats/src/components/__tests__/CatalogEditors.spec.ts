import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ActionsEditor from '../ActionsEditor.vue'
import EventsEditor from '../EventsEditor.vue'
import { useActionsStore } from '@/stores/ActionsStore'
import { useEventsStore } from '@/stores/EventsStore'
import { useKeyboardStore } from '@/stores/keyboardStore'

describe('catalog editors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const data =
          url === '/events.json'
            ? [{ id: 'e1', name: 'Pull', description: 'Start a point.' }]
            : url === '/actions/positive_actions.json'
              ? [{ id: 'pa4', name: 'Score', terminal: true }]
              : [{ id: 'na1', name: '', terminal: false }]

        return Promise.resolve({
          ok: true,
          json: async () => data,
        })
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('allows removing empty actions and creating a positive action', async () => {
    const wrapper = mount(ActionsEditor)
    const actionsStore = useActionsStore()
    await vi.waitFor(() => expect(actionsStore.negativeActions).toHaveLength(1))

    await wrapper.get('[aria-label="Remove empty negative action"]').trigger('click')
    expect(actionsStore.negativeActions).toHaveLength(0)

    const draftInput = wrapper.findAll('section')[0].findAll('sl-input')[1]
    draftInput.element.value = 'Interception'
    await draftInput.trigger('input')

    await vi.waitFor(() => expect(actionsStore.positiveActions).toHaveLength(2))
    expect(actionsStore.positiveActions[1]).toMatchObject({
      name: 'Interception',
      description: '',
      terminal: false,
    })
    wrapper.unmount()
  })

  it('allows removing empty events and creating an event', async () => {
    const wrapper = mount(EventsEditor)
    const eventsStore = useEventsStore()
    await vi.waitFor(() => expect(eventsStore.events).toHaveLength(1))

    eventsStore.events.push({ id: 'empty-event', name: '', description: '' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[aria-label="Remove empty event"]').trigger('click')
    expect(eventsStore.events.map((event) => event.id)).toEqual(['e1'])

    const draftInput = wrapper.findAll('sl-input').at(-1)!
    draftInput.element.value = 'Timeout'
    await draftInput.trigger('input')

    await vi.waitFor(() => expect(eventsStore.events).toHaveLength(2))
    expect(eventsStore.events[1]).toMatchObject({
      name: 'Timeout',
      description: '',
    })
    wrapper.unmount()
  })

  it.each([
    ['ActionsEditor', ActionsEditor],
    ['EventsEditor', EventsEditor],
  ])(
    '%s suppresses bound shortcuts while open and restores them on close',
    async (_name, Editor) => {
      const keyboardStore = useKeyboardStore()
      const callback = vi.fn()
      keyboardStore.registerShortcutTarget('test-target', {
        message: () => '',
        callback,
        setShortcut: () => {},
        removeShortcut: () => {},
      })
      keyboardStore.addKeyBinding('q', 'test-target')

      const wrapper = mount(Editor)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true }))
      expect(callback).not.toHaveBeenCalled()

      wrapper.unmount()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true }))
      expect(callback).toHaveBeenCalledOnce()
    },
  )
})
