import {
  applyMiddleware as originalApplyMiddleware,
  createStore as originalCreateStore,
  combineReducers as originalCombineReducers,
  bindActionCreators as originalBindActionCreators,
  compose as originalCompose,
} from '../../../node_modules/redux/lib/redux.js'

import devToolsMiddleware from './middleware'
import devToolsStore from './store'
import enhancedReducer from './reducers/index'
// import extensions  from '../../dist/extensions'
//export { createStore } from './redux-toolkit.ts'

interface IRedispatchOptions {
  shift?: number,
  payload?: any
}

export const applyMiddleware = originalApplyMiddleware
export const combineReducers = originalCombineReducers
export const bindActionCreators = originalBindActionCreators
export const compose = originalCompose

export const createStore = function (reducer: any, initialState: any, enhancers: any) {
  // if createStore gets called for the second time, then it has to be called from 3rd-party module
  if((window as any).store) {
    return originalCreateStore(reducer, initialState, enhancers)
  }
  let store =originalCreateStore(enhancedReducer(reducer), initialState, originalCompose(enhancers, originalApplyMiddleware(devToolsMiddleware)))
  store = devToolsStore(store);
  (window as any).store = store
  return store
}