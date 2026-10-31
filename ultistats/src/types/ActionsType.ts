export interface Action {
  type: ActionType
  id: string
  name: string
  description?: string
  key?: string
  terminal: boolean
}

export enum ActionType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export interface ActionData {
  name: string
  description?: string
  terminal: boolean
}
