import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ActionsEditor from '../ActionsEditor.vue'
import EventsEditor from '../EventsEditor.vue'
import { useActionsStore } from '@/stores/ActionsStore'
import { useEventsStore } from '@/stores/EventsStore'
import { useKeyboardStore } from '@/stores/keyboardStore'
import { ActionType } from '@/types/ActionsType'

describe('catalog editors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const data =
          url === '/events.json'
            ? [{ id: 'e2', name: 'Foul', description: 'Called by a player.' }]
            : url === '/actions/positive_actions.json'
              ? [{ id: 'pa4', name: 'Score', core: true }]
              : [{ id: 'na1', name: '' }]

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

  it('edits core status and exposes clear and remove controls', async () => {
    const wrapper = mount(ActionsEditor)
    const actionsStore = useActionsStore()
    await vi.waitFor(() => expect(actionsStore.negativeActions).toHaveLength(1))
    expect(actionsStore.positiveActions[0].core).toBe(true)

    const coreSection = wrapper.find('.core-actions')
    const coreCheckbox = coreSection.get<HTMLInputElement>('[aria-label="Score is core"]')
    expect(coreCheckbox.element.checked).toBe(true)
    await coreCheckbox.setValue(false)
    expect(actionsStore.positiveActions[0].core).toBe(false)
    expect(wrapper.find('.core-actions').find('[aria-label="Score name"]').exists()).toBe(false)

    const positiveSection = wrapper.findAll('section')[1]
    const positiveCheckbox = positiveSection.get<HTMLInputElement>('[aria-label="Score is core"]')
    await positiveCheckbox.setValue(true)
    expect(actionsStore.positiveActions[0].core).toBe(true)
    expect(wrapper.find('.core-actions').find('[aria-label="Score name"]').exists()).toBe(true)

    await wrapper.get('[aria-label="Clear Score"]').trigger('click')
    expect(actionsStore.positiveActions[0]).toMatchObject({
      name: '',
      description: '',
      core: false,
    })
    await wrapper.get('[aria-label="Remove pa4"]').trigger('click')
    expect(actionsStore.positiveActions).toHaveLength(0)

    await wrapper.get('[aria-label="Remove na1"]').trigger('click')
    expect(actionsStore.negativeActions).toHaveLength(0)

    const draftInput = wrapper.findAll('section')[1].get('sl-input')
    draftInput.element.value = 'Interception'
    await draftInput.trigger('input')

    await vi.waitFor(() => expect(actionsStore.positiveActions).toHaveLength(1))
    expect(actionsStore.positiveActions[0]).toMatchObject({
      name: 'Interception',
      description: '',
      core: false,
    })
    wrapper.unmount()
  })

  it('removes terminal metadata from imported actions', () => {
    const actionsStore = useActionsStore()
    actionsStore.setActions(
      [
        {
          id: 'pa4',
          name: 'Score',
          type: ActionType.POSITIVE,
          terminal: true,
        },
      ],
      [],
    )

    expect(actionsStore.positiveActions[0]).not.toHaveProperty('terminal')
  })

  it('allows removing empty events and creating an event', async () => {
    const wrapper = mount(EventsEditor)
    const eventsStore = useEventsStore()
    await vi.waitFor(() => expect(eventsStore.events).toHaveLength(1))

    eventsStore.events.push({ id: 'empty-event', name: '', description: '' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[aria-label="Remove empty event"]').trigger('click')
    expect(eventsStore.events.map((event) => event.id)).toEqual(['e2'])

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
