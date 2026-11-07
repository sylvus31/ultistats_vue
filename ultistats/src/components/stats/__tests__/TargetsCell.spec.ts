import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TargetsCell from '../TargetsCell.vue'

describe('TargetsCell player colors', () => {
  it('underlines player names with the supplied team colors', () => {
    const wrapper = mount(TargetsCell, {
      props: {
        value: new Map([
          ['Player One', 2],
          ['Player Two', 1],
        ]),
        playerColors: new Map([
          ['Player One', '#00bcd4'],
          ['Player Two', '#b05959'],
        ]),
      },
    })
    const names = wrapper.findAll('.player-name')

    expect(names).toHaveLength(2)
    expect((names[0].element as HTMLElement).style.textDecorationColor).toBe('#00bcd4')
    expect((names[1].element as HTMLElement).style.textDecorationColor).toBe('#b05959')
  })
})
