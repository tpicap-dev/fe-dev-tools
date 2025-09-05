import { assocPath } from 'ramda'

import ACTION_TYPES from '../actions/types'

export default (state = {}, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_STATE:
      return action.payload
    default:
      return state
  }
}