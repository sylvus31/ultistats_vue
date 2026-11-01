export interface Action {
  type: ActionType
  id: string
  name: string
  description?: string
  key?: string
  core?: boolean
}

export enum ActionType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export interface ActionData {
  id: string
  name: string
  description?: string
  core?: boolean
}
