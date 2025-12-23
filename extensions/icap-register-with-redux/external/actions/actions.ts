import ACTION_TYPES from './types'

export const setState = (payload: { reducerName: string, value: any }) => ({
  type: ACTION_TYPES.SET_STATE,
  payload,
})