import { filter, find, forEach, is, isEmpty, isNil, keys, modifyPath, pipe, prop, values } from 'ramda'

import { setState } from './actions/actions'
import enhancedReducer from './reducer'

import { findMatch, findMatches, findProp } from '../../../external/modules/ladash/ladash'
import { getActionByType, getActions } from '../../../external/modules/redux/actions-cache'
import devToolsMiddleware from '../../../external/modules/redux/middleware'
import ReduxLogger from '../../../external/modules/redux-logger/redux-logger'
import { setVar } from '../../../external/utils/vars-persistence'
import constants from '../../../shared/constants.json'

export default (store: any) => {

  store.addMiddleware?.(devToolsMiddleware)
  store.addMiddleware?.(ReduxLogger.middleware)

  const getAppState = () => store.getState()[constants.APP_ID]

  return {
    ...store,
    addReducer: (reducerName, reducer) => {
      return store.addReducer(reducerName, enhancedReducer(reducerName, reducer))
    },
    get state() { return store.getState() },
    get appState() { return getAppState() },
    setField: (path: string, value: any) => {
      if (isNil(path) || isEmpty(path)) {
        return
      }
      const pathArr = String(path).split('.').map(segment => isNaN(segment as any) ? segment : Number(segment))
      pathArr.shift()
      const reducerName = pathArr.shift()
      const state = getAppState()?.[reducerName]

      if (!state) return
      store.dispatch(setState({
        reducerName,
        value: modifyPath(pathArr, () => value, state)
      }))
    },
    logger: ReduxLogger,
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
      const panelPath = pipe(
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
      )(getAppState());
      (window as any).store.setField(`${panelPath}.${path}`, value)
    },
    setMatchingFields: (obj, value) => {
      const state = getAppState()
      const matches = findMatches(state, obj)
      forEach(({ path, value: prevValue }) => {
        const newState = { ...state, ...modifyPath(path, () => ({ ...prevValue, ...value }), state) }
        setTimeout(() => store.dispatch(setState({
          reducerName: path[0],
          value: newState[path[0]]
        })))
      }, matches)
      return matches.map(e => e.path)
    },
    setMatchingField: (obj, value, pathOrPropName = []) => {
      const state = getAppState()
      const path = is(String, pathOrPropName) ? findProp(state, pathOrPropName)[0]?.path : pathOrPropName
      const match = findMatch(state, obj, path)
      if (!match) {
        return []
      }

      const newState = modifyPath([...path, ...match.path], () => ({ ...match.value, ...value }), state)
      store.dispatch(setState({
        reducerName: path[0],
        value: newState[path[0]]
      }))
      return match.path
    }
  }
}