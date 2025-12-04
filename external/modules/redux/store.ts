import { find, forEach, is, keys, modifyPath, pipe, prop, values } from 'ramda'

import { getActionByType, getActions } from './actions-cache'
import { setState } from './actions/index'
import enhancedReducer from './reducers/index'
import { setVar } from "../../utils/vars-persistence"
import { findMatch, findMatches, findProp } from '../ladash/ladash'

interface IRedispatchOptions {
  shift?: number,
  payload?: any,
  customProp?: any,
}

export default (store: any) => ({
  ...store,
  replaceReducer: (arg: Function) => {
    return store.replaceReducer(enhancedReducer(arg))
  },
  // get state() { return store.getState() },
  state() { return store.getState() },
  panelState: (panelType: string) => {
    if (!panelType) {
      return undefined
    }

    return pipe(
      prop('panels'),
      (panels: {  [panelType: string]: any }) => {
        const panelTypes: string[] = keys(panels) as string[]
        if (panelType.endsWith('$')) {
          return pipe(
            find((existingPanelType: string) => existingPanelType.toLowerCase() === panelType.toLowerCase().substring(0, panelType.length - 1)),
            (existingPanelType: string) => panels[existingPanelType]
          )(panelTypes)
        }
        return pipe(
          find((existingPanelType: string) => existingPanelType.toLowerCase().includes(panelType.toLowerCase())),
          (existingPanelType: string) => panels[existingPanelType]
        )(panelTypes)
      },
      values,
      (panels: any) => panels.length > 1 ? panels: panels[0]
    )(store.getState())
  },
  getActions: getActions,
  getAction: getActionByType,
  redispatch: (type: string, options: IRedispatchOptions = {}) => {
    const action = getActionByType(type, options)
    if (action) {
      store.dispatch(action)
    } else {
      console.log('couldn\'t find action', type)
    }
  },
  disableAction: ({type, exception}: { type: string, exception?: any }) => {
    if ((window as any).disabledActions) {
      setVar('disabledActions', [...(window as any).disabledActions, { type, exception }])
    } else{
      setVar('disabledActions', [{ type, exception }])
    }
  },
  enableAction: (type: string) => {
    if ((window as any).disabledActions) {
      setVar('disabledActions', (window as any).disabledActions.filter((existingAction: any) => !existingAction.type.includes(type) && !type.includes(existingAction.type)))
    }
  },
  enableActions: () => {
    setVar('disabledActions', [])
  },
  setField: (path: string, value: any) => {
    const state = store.getState()
    const pathArr = String(path).split('.').map(segment => isNaN(segment as any) ? segment : Number(segment))
    store.dispatch(setState(modifyPath(pathArr, () => value, state)))
  },
  setPanelField: (panelType: string, path: string, value: any) => {
    const panelPath = pipe(
      prop('panels'),
      (panels: any) => (
        pipe<any,any,any,any>(
          keys,
          find((existingPanelType: string) => existingPanelType.toLowerCase().includes(panelType.toLowerCase())),
          (existingPanelType: string) => {
            if (!existingPanelType) {
              return ''
            }
            const panel = panels[existingPanelType]
            const panelIds = keys(panel)
            const panelId = panelIds[0]
            return `panels.${existingPanelType}.${String(panelId)}`
          }
        )(panels)
      )
    )(store.getState());
    (window as any).store.setField(`${panelPath}.${path}`, value)
  },
  setMatchingFields: (obj, value) => {
    const state = store.getState()
    const matches = findMatches(state, obj)
    let newState = state
    forEach(({ path, value: prevValue }) => {
      newState = { ...newState, ...modifyPath(path, () => ({ ...prevValue, ...value }), newState) }
    }, matches)
    setTimeout(() => store.dispatch(setState(newState)))
    return matches.map(e => e.path)
  },
  setMatchingField: (obj, value, pathOrPropName = []) => {
    const state = store.getState()
    const path = is(String, pathOrPropName) ? findProp(state, pathOrPropName)[0]?.path : pathOrPropName
    const match = findMatch(state, obj, path)
    if (!match) {
      return []
    }
    store.dispatch(setState(modifyPath([...path, ...match.path], () => ({ ...match.value, ...value }), state)))
    return match.path
  }
})