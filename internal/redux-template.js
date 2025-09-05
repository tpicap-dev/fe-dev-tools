import { assocPath, is, path, pipe, values } from 'ramda'

/* ACTIONS_IMPORT */

import constants from '../shared/constants.json' 
const  { APP_ID, REDUCER, REDUX_STORE_PATH, STORE }  = constants

import { setState } from './actions'
import devToolsReducer from './reducers'

let reducer
let storeUnsubscribe = () => null
export let store
import('newcommon/redux/store').then(module => store = is(Function, module[STORE.variable]) ? module[STORE.variable]() : module[STORE.variable])
import('newcommon/reducers/index.js').then(module => reducer = is(Function, module[REDUCER.variable]) ? module[REDUCER.variable]() : module[REDUCER.variable])
export const panelActionsDispatcher = (panelName, actionName) => {
  return (...args) => {
    switch (panelName) {

      /* ACTIONS_SWITCH */

      default: break
    }
  }
}

export const dispatch = action => {
  store.dispatch(action)
}

export const panelState = (panelFieldName) => {
  if (!panelFieldName) {
    return undefined
  }

  return pipe(
    path(['panels', panelFieldName]),
    values,
    panels => panels.length > 1 ? panels: panels[0]
  )(store.getState())
}

export const state = () => {
  return store.getState()
}

export const setField = (path, value) => {
  const state = store.getState()
  store.replaceReducer(devToolsReducer)
  store.dispatch(setState(assocPath(path, value, state)))
  // setTimeout(() => store.replaceReducer(reducer))
}

export const logActions = () => {
  storeUnsubscribe = store.subscribe(s => console.log(s))
}

export const stopLoggingActions = () => {
  storeUnsubscribe()
}