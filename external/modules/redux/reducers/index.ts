import { values } from 'ramda'

import ACTION_TYPES from '../actions/types'

const devToolsReducer = (state = {}, action: any) => {
  switch (action.type) {
    case ACTION_TYPES.SET_STATE:
      return action.payload
    default:
      return state
  }
}

export default (appReducer: Function) => (...args: [any, any]) => {
  if (values(ACTION_TYPES).includes(args?.[1]?.type)) {
    return devToolsReducer(args?.[0], args?.[1])
  }

  return appReducer(args?.[0], args?.[1])
}