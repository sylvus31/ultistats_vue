import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ActionsSelector from '../ActionsSelector.vue'
import { useActionsStore } from '@/stores/ActionsStore'
import { ActionType } from '@/types/ActionsType'

describe('ActionsSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: async () => [],
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows core actions separately from other actions', () => {
    const actionsStore = useActionsStore()
    actionsStore.setActions(
      [
        { id: 'score', name: 'Score', core: true, type: ActionType.POSITIVE },
        { id: 'pickup', name: 'Pick up disc', type: ActionType.POSITIVE },
        { id: 'pull', name: 'Pull', core: true, type: ActionType.POSITIVE },
        { id: 'defense', name: 'Defense', core: true, type: ActionType.POSITIVE },
      ],
      [],
    )

    const titleActions = mount(ActionsSelector, { props: { coreOnly: true } })
    const otherActions = mount(ActionsSelector)

    expect(titleActions.text()).toContain('Score')
    expect(titleActions.text()).toContain('Pull')
    expect(titleActions.text()).toContain('Defense')
    expect(titleActions.text()).not.toContain('Pick up disc')
    expect(otherActions.text()).toContain('Pick up disc')
    expect(otherActions.text()).not.toContain('Score')

    titleActions.unmount()
    otherActions.unmount()
  })
})
