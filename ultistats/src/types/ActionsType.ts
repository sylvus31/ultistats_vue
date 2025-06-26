export interface Action {
  type: ActionType
  id: string
  name: string
  key?: string
  terminal: boolean
}

export enum ActionType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export interface ActionData {
  name: string
  terminal: boolean
}
