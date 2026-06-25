import {
  filter, find, forEach,
  is, isEmpty, isNil, keys, mapObjIndexed, modifyPath, path as RPath, pipe, prop, startsWith, uniq, values
} from 'ramda'

import { setState } from './actions/actions'
import enhancedReducer from './reducer'

import { findMatch, findMatches, findProp } from '../../../external/modules/ladash/ladash'
import { getActionByType, getActions, startCaching, stopCaching } from '../../../external/modules/redux/actions-cache'
import devToolsMiddleware from '../../../external/modules/redux/middleware'
import { IRedispatchOptions } from '../../../external/modules/redux/store'
import ReduxLogger from '../../../external/modules/redux-logger/redux-logger'
import { getVar, setVar } from '../../../external/utils/vars-persistence'
import constants from '../../../shared/constants.json'

let state: any = {};

const modifiedPaths: (string | number)[][] = []
const pathExceptions: (string | number)[] = ['fifx-client']

const getPanelPath = (panelType, state) => (
  pipe(
    prop('panels'),
    (panels: any) => (
      pipe<any,any,any,any>(
        keys,
        find((panelId: string) => panels[panelId].panelType?.toLowerCase().includes(panelType.toLowerCase())),
        (panelId: string) => {
          if (!panelId) {
            return ''
          }
          return `${constants.APP_ID}.panels.${panelId}`
        }
      )(panels)
    )
  )(state)
)

export default (store: any) => {
  state = store.getState()

  store.subscribe(() => {
    let newState = store.getState()
    if (isEmpty(modifiedPaths)) {
      state = { ...newState }
    } else {
      let updatedState = { ...newState }
      const persistentPaths = modifiedPaths.filter(path => !startsWith(pathExceptions, path))
      forEach((path: any) => updatedState = modifyPath(path, () => RPath(path, state), updatedState), uniq(persistentPaths))
      state = updatedState
    }
  })

  // waiting for the project app to add middleware, to actually prepend dev-tools middlewares
  setTimeout(() => store.addMiddleware?.(devToolsMiddleware))

  store.addMiddleware?.(ReduxLogger.middleware)

  const getAppState = () => store.getState()[constants.APP_ID]

  const retStore = {
    ...store,
    addReducer: (reducerName, reducer) => {
      return store.addReducer(reducerName, enhancedReducer(reducerName, reducer))
    },
    addReducers: (reducers: { reducerKey: string, reducer: Function }[]) => {
      return store.addReducers(
        (reducers || []).map((entry) => ({
          reducerKey: entry.reducerKey,
          reducer: enhancedReducer(entry.reducerKey, entry.reducer)
        }))
      )
    },
    getState: () => { return state; },
    get state() { return state; },
    getAppState() { return getAppState() },
    get appState() { return getAppState() },
    setField: (path: string, value: any) => {
      if (isNil(path) || isEmpty(path)) {
        return
      }
      const pathArr = String(path).split('.').map(segment => isNaN(segment as any) ? segment : Number(segment))
      const reducerName = String(pathArr[1])
      const subState = getAppState()?.[reducerName]

      if (!state) return

      if (isNil(pathArr) || isEmpty(pathArr)) return

      state = modifyPath(pathArr, () => value, state)
      modifiedPaths.push(pathArr)

      if (subState) {
        store.dispatch(setState({
          reducerName,
          value: pathArr.length ? modifyPath(pathArr.slice(2), () => value, subState) : value
        }))
      } else {
        store.dispatch(setState({ reducerName: 'dummy', value: null }))
      }
    },
    logger: ReduxLogger,
    cacheActions: (cache: boolean) => cache ? startCaching() : stopCaching(),
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
    isolateFe: () => {
      (window as any).store.disableAction({ type: 'mq/MSG' })
    },
    deisolateFe: () => {
      (window as any).store.enableAction('mq/MSG')
    },
    isFeIsolated: () => {
      if (!((window as any).disabledActions || []).length) {
        return false
      }
      return (window as any).disabledActions?.some((action: any) => action.type.includes('mq/MSG'))
    },
    panelState: (panelType: string) => {
      if (!panelType) {
        return undefined
      }

      return pipe(
        prop('panels'),
        values,
        (panels: any[]) => {
          if (panelType.endsWith('$')) {
            return filter((panel: any) => panel.panelType?.toLowerCase() === panelType.toLowerCase().substring(0, panelType.length - 1), panels)
          }
          return filter((panel: any) => panel.panelType?.toLowerCase().includes(panelType.toLowerCase()), panels)
        },
        (panels: any) => panels.length > 1 ? panels: panels[0]
      )(getAppState())
    },
    setPanelField: (panelType: string, path: string, value: any) => {
      const panelPath = getPanelPath(panelType, getAppState());
      (window as any).store.setField(`${panelPath}.${path}`, value)
    },
    setMatchingFields: (obj, value) => {
      const matches = findMatches(state, obj)
      forEach(({ path, value: prevValue }) => {
        state = { ...state, ...modifyPath(path, () => ({ ...prevValue, ...value }), state) }
      }, matches)
      return matches.map(e => e.path)
    },
    setMatchingField: (obj, value, pathOrPropName = []) => {
      const path = is(String, pathOrPropName) ? findProp(state, pathOrPropName)[0]?.path : pathOrPropName
      const match = findMatch(state, obj, path)
      if (!match) {
        return []
      }

      state = modifyPath([...path, ...match.path], () => ({ ...match.value, ...value }), state)
      return match.path
    },
    onLoad(f: () => void) {
      setVar('storeOnLoad', f)
    }
  }

  const storeOnLoad = getVar('storeOnLoad')

  if (storeOnLoad) {
    try {
      eval(storeOnLoad)(retStore)
    } catch (e) {}
  }

  return retStore
}