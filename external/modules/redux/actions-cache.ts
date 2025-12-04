import constants from '../../../shared/constants.json'
import { isEmpty, mergeDeepRight } from 'ramda'

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
    payload = {},
    customProp = {},
  }: { shift?: number, payload?: any, customProp?: any } = {}) => {

  const typeActions = actions.filter(action => action.type.includes(type))
  if (!typeActions || isEmpty(typeActions)) {
    return
  }
  const action = typeActions[typeActions.length - 1 - shift]
  if (!action) {
    return
  }

  let ret = action

  if (!isEmpty(payload)) {
    ret = { ...ret, payload: Object.assign({}, ret.payload, payload) }
  }

  if(!isEmpty(customProp)) {
    try {
      ret = mergeDeepRight(ret, customProp)
    } catch(e) {
      console.error('Could not assign custom prop to action')
      console.error(e)
    }
  }

  return ret
}