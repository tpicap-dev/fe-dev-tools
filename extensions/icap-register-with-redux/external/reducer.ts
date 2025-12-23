import { values } from 'ramda'

import ACTION_TYPES from './actions/types'

const devToolsReducer = (state = {}, action: {  type: string, payload: { reducerName: string, value: string } }, reducerName: string) => {
  switch (action.type) {
    case ACTION_TYPES.SET_STATE:
      if (action.payload.reducerName !== reducerName) return state
      return action.payload.value
    default:
      return state
  }
}

export default (reducerName: string, appReducer: Function) => (...args: [any, any]) => {
  if (values(ACTION_TYPES).includes(args?.[1]?.type)) {
    return devToolsReducer(args?.[0], args?.[1], reducerName)
  }

  return appReducer(args?.[0], args?.[1])
}