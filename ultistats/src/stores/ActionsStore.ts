import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Action, ActionData } from '@/types/ActionsType'
import { ActionType } from '@/types/ActionsType'

export const useActionsStore = defineStore('actionsStore', () => {
  const positiveActions = ref<Action[]>([])
  const negativeActions = ref<Action[]>([])
  let hasImportedActions = false

  fetch('/actions/positive_actions.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (hasImportedActions) return
      positiveActions.value = []
      data.forEach((action: ActionData) => {
        positiveActions.value?.push({
          id: action.id,
          name: action.name,
          description: action.description,
          core: action.core ?? false,
          type: ActionType.POSITIVE,
        })
      })
    })

  fetch('/actions/negative_actions.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (hasImportedActions) return
      negativeActions.value = []
      data.forEach((action: ActionData) => {
        negativeActions.value?.push({
          id: action.id,
          name: action.name,
          description: action.description,
          core: action.core ?? false,
          type: ActionType.NEGATIVE,
        })
      })
    })

  function setActions(
    importedPositiveActions: Array<Action & { terminal?: boolean }>,
    importedNegativeActions: Array<Action & { terminal?: boolean }>,
  ) {
    hasImportedActions = true
    const removeTerminal = (action: Action & { terminal?: boolean }): Action => {
      const cleanAction = { ...action }
      delete cleanAction.terminal
      return cleanAction
    }
    positiveActions.value = importedPositiveActions.map(removeTerminal)
    negativeActions.value = importedNegativeActions.map(removeTerminal)
  }

  function getActionByID(id: string): Action | undefined {
    const action = positiveActions.value?.find((a) => a.id === id)
    if (action) {
      return action
    }
    return negativeActions.value?.find((a) => a.id === id)
  }

  return { positiveActions, negativeActions, getActionByID, setActions }
})
