import { find, isNil, keys, pipe, prop, values } from 'ramda'

import { configureStore } from '@reduxjs/toolkit'
import {
  applyMiddleware as originalApplyMiddleware,
  createStore as originalCreateStore,
  combineReducers as originalCombineReducers,
  bindActionCreators as originalBindActionCreators,
  compose as originalCompose,
  // isAction as originalIsAction,
  // isPlainObject as originalIsPlainObject,
  // isPlainObject2 as originalIsPlainObject2,
} from '../../../node_modules/redux/dist/redux.js'

import devToolsMiddleware from './middleware'
import { getActionByType } from './actions-cache'

interface IRedispatchOptions {
  shift?: number,
  payload?: any
}

export const applyMiddleware = originalApplyMiddleware
export const combineReducers = originalCombineReducers
export const bindActionCreators = originalBindActionCreators
export const compose = originalCompose
// export const isAction = originalIsAction
// export const isPlainObject = originalIsPlainObject
// export const isPlainObject2 = originalIsPlainObject2

export let createStore = function (reducer: any, initialState: any, enhancers: any) {
  // const store =originalCreateStore(reducer, initialState, originalCompose(enhancers, originalApplyMiddleware(devToolsMiddleware)));
  const store: any = configureStore({
    reducer,
    preloadedState: initialState,
    // middleware: (getDefaultMiddleWare: any) => getDefaultMiddleWare().concat(devToolsMiddleware),
    middleware: (getDefaultMiddleWare: any) => getDefaultMiddleWare().concat([...enhancers, devToolsMiddleware])
  });
  (window as any).store = {
    ...store,
    get state() { return store.getState() },
    panelState: (panelType: string) => {
      if (!panelType) {
        return undefined
      }

      return pipe(
        prop('panels'),
        (panels: any) => {
          const panelTypes = keys(panels)
          return pipe<any,any,any>(
            find((existingPanelType: string) => existingPanelType.toLowerCase().includes(panelType.toLowerCase())),
            (existingPanelType: string) => panels[existingPanelType]
          )(panelTypes)
        },
        values,
        (panels: any) => panels.length > 1 ? panels: panels[0]
      )(store.getState())
    },
    redispatch: (type: string, options: IRedispatchOptions = {}) => {
      const action = getActionByType(type, options)
      if (action) {
        store.dispatch(action)
      } else {
        console.log('couldn\'t find action', type)
      }
    }
  }
  return store
}