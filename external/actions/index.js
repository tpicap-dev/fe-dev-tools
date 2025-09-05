import ACTION_TYPES from './types'

export const setState = payload => ({
  type: ACTION_TYPES.SET_STATE,
  payload,
})