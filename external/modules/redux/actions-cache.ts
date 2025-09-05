import constants from '../../../shared/constants.json'
import { isEmpty } from 'ramda'

let actions: any[] = []

export const addAction = (action: any) => {
  actions.push(action);
  // @ts-ignore
  actions = actions.slice(-(constants.ACTIONS_CACHE_LIMIT || 500));
}

export const getActions = () => actions

export const getActionByType = (
  type: string,
  {
    shift = 0,
    payload = {}
  }: { shift?: number, payload?: any } = {}) => {

  const typeActions = actions.filter(action => action.type.includes(type))
  if (!typeActions || isEmpty(typeActions)) {
    return
  }
  const action = typeActions[typeActions.length - 1 - shift]
  if (!action) {
    return
  }
  return {
    ...action,
    payload: !isEmpty(payload) ? Object.assign({}, action.payload, payload) : action.payload,
  }
}