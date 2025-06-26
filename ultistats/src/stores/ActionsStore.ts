import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Action, ActionData } from '@/types/ActionsType'
import { ActionType } from '@/types/ActionsType'

export const useActionsStore = defineStore('actionsStore', () => {
  const positiveActions = ref<Action[]>()
  const negativeActions = ref<Action[]>()

  fetch('/actions/positive_actions.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let nb = 1
      positiveActions.value = []
      data.forEach((action: ActionData) => {
        positiveActions.value?.push({
          id: 'pa' + nb,
          name: action.name,
          terminal: action.terminal,
          type: ActionType.POSITIVE,
        })
        nb++
      })
    })
  fetch('/actions/negative_actions.json')
    .then((response) => response.json())
    .then((data) => {
      let nb = 1
      negativeActions.value = []
      data.forEach((action: ActionData) => {
        negativeActions.value?.push({
          id: 'na' + nb,
          name: action.name,
          terminal: action.terminal,
          type: ActionType.NEGATIVE,
        })
        nb++
      })
    })

  return { positiveActions, negativeActions }
})
