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
            ? [
                { id: 'e2', name: 'Foul', description: 'Called by a player.' },
                { id: 'e3', name: 'Timeout', description: 'A timeout is called.' },
                { id: 'e4', name: 'Game stoppage', description: 'The game is stopped.' },
              ]
            : url === '/actions/positive_actions.json'
              ? [{ id: 'pa4', name: 'Score', description: 'Points the team scores.', core: true }]
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

  it('does not allow editing core action descriptions', async () => {
    const wrapper = mount(ActionsEditor)
    await vi.waitFor(() => expect(useActionsStore().positiveActions).toHaveLength(1))

    const description = wrapper.get<HTMLTextAreaElement>(
      '.core-actions [aria-label="Score description"]',
    )
    expect(description.element.readOnly).toBe(true)
    expect(description.element.value).toBe('Points the team scores.')

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

  it('locks core event descriptions and allows managing non-core events', async () => {
    const wrapper = mount(EventsEditor)
    const eventsStore = useEventsStore()
    await vi.waitFor(() => expect(eventsStore.events).toHaveLength(3))

    const coreSection = wrapper.find('.core-events')
    expect(coreSection.findAll('tbody tr')).toHaveLength(3)
    for (const name of ['Foul', 'Timeout', 'Game stoppage']) {
      expect(
        coreSection.get<HTMLTextAreaElement>(`[aria-label="${name} description"]`).element.readOnly,
      ).toBe(true)
      expect(coreSection.find(`[aria-label="Clear ${name}"]`).exists()).toBe(false)
      expect(coreSection.find(`[aria-label="Remove ${name}"]`).exists()).toBe(false)
    }

    const foulName = coreSection.get('sl-input[aria-label="Foul name"]')
    foulName.element.value = 'Changed foul'
    await foulName.trigger('input')
    expect(eventsStore.events[0].name).toBe('Changed foul')
    expect(eventsStore.events[0].description).toBe('Called by a player.')

    eventsStore.events.push({
      id: 'custom-event',
      name: 'Custom event',
      description: 'Custom description',
      core: false,
    })
    await wrapper.vm.$nextTick()
    const customDescription = wrapper.get<HTMLTextAreaElement>(
      '[aria-label="Custom event description"]',
    )
    expect(customDescription.element.readOnly).toBe(false)
    await customDescription.setValue('Updated description')
    expect(eventsStore.events[3].description).toBe('Updated description')
    await wrapper.get('[aria-label="Clear Custom event"]').trigger('click')
    expect(eventsStore.events[3]).toMatchObject({ name: '', description: '', core: false })
    await wrapper.get('[aria-label="Remove custom-event"]').trigger('click')
    expect(eventsStore.events.map((event) => event.id)).toEqual(['e2', 'e3', 'e4'])

    const draftInput = wrapper.findAll('sl-input').at(-1)!
    draftInput.element.value = 'Timeout'
    await draftInput.trigger('input')

    await vi.waitFor(() => expect(eventsStore.events).toHaveLength(4))
    expect(eventsStore.events[3]).toMatchObject({
      name: 'Timeout',
      description: '',
      core: false,
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
