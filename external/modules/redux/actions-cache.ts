import constants from '../../../shared/constants.json'
import { any, isEmpty, isNil, mergeDeepRight } from 'ramda'
import { getVar, setVar } from '../../utils/vars-persistence'

export interface IGetActionsParams {
  types?: string[];
  limit?: number;
  exclude?: string[];
}

let actions: any[] = []

export const addAction = (action: any) => {
  actions.push(action);

  if (actions.length > constants.ACTIONS_CACHE_LIMIT) {
    // @ts-ignore
    actions = actions.slice(-(constants.ACTIONS_CACHE_LIMIT || 500));
  }
}

export const getActions = (params?: IGetActionsParams) => {
  if (isNil(params)) {
    return actions
  }

  let retActions = actions

  if (params.exclude) {
    retActions = retActions.filter(action => !any(exclude => String(action.type).toLowerCase().includes(exclude.toLowerCase()), params.exclude))
  }

  if (params.types) {
    retActions = retActions.filter(action => any(type => String(action.type).toLowerCase().includes(type.toLowerCase()), params.types))
  }

  if (params.limit) {
    retActions = retActions.slice(-params.limit)
  }

  return retActions
}

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

export const startCaching = () => setVar('isActionsCachingOn', true)

export const stopCaching = () => setVar('isActionsCachingOn', false)

export const isCachingOn = () => Boolean(getVar('isActionsCachingOn'))