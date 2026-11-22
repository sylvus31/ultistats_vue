import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WindowHolder from '../WindowHolder.vue'

describe('WindowHolder fullscreen control', () => {
  it('does not render a fullscreen control by default', () => {
    const wrapper = mount(WindowHolder, {
      props: { title: 'Players', editorComponent: './PlayerEditor.vue' },
    })

    expect(wrapper.find('[aria-label="Open full window"]').exists()).toBe(false)
    expect(wrapper.find('[title="Edit"]').exists()).toBe(false)
  })

  it('renders before Edit and toggles fullscreen when enabled', async () => {
    const wrapper = mount(WindowHolder, {
      props: {
        title: 'Stats players',
        allowFullscreen: true,
        allowEdit: true,
      },
    })
    const actions = wrapper.find('.actions')
    const buttons = actions.findAll('button')

    expect(buttons[0].attributes('aria-label')).toBe('Open full window')
    expect(buttons[1].attributes('title')).toBe('Edit')

    await buttons[0].trigger('click')
    expect(wrapper.find('.window-container').classes()).toContain('window-container-fullscreen')
    expect(wrapper.find('[aria-label="Restore window"]').exists()).toBe(true)

    await wrapper.get('[aria-label="Restore window"]').trigger('click')
    expect(wrapper.find('.window-container').classes()).not.toContain('window-container-fullscreen')
  })

  it('expands vertically within the viewport without entering fullscreen', async () => {
    const wrapper = mount(WindowHolder, {
      props: { title: 'Search results', allowVerticalExpand: true },
    })

    await wrapper.get('[aria-label="Expand vertically"]').trigger('click')

    const container = wrapper.get<HTMLElement>('.window-container')
    const maxHeight = Number.parseFloat(container.element.style.maxHeight)
    expect(container.classes()).toContain('window-container-vertically-expanded')
    expect(container.classes()).not.toContain('window-container-fullscreen')
    expect(maxHeight).toBeGreaterThan(0)
    expect(maxHeight).toBeLessThan(window.innerHeight)

    await wrapper.get('[aria-label="Restore height"]').trigger('click')
    expect(container.classes()).not.toContain('window-container-vertically-expanded')
    expect(container.element.style.maxHeight).toBe('')
    wrapper.unmount()
  })

  it('renders the before-edit slot immediately before Edit', () => {
    const wrapper = mount(WindowHolder, {
      props: { title: 'Players', allowEdit: true },
      slots: {
        'before-edit': '<button aria-label="Filter players">Eye</button>',
      },
    })
    const actions = wrapper.find('.actions')

    const buttons = actions.findAll('button')

    expect(buttons[0].attributes('aria-label')).toBe('Filter players')
    expect(buttons[1].attributes('title')).toBe('Edit')
    expect(actions.find('button[aria-label="Filter players"]').element.nextElementSibling).toBe(
      actions.find('[title="Edit"]').element,
    )
  })
})
