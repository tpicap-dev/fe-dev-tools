import { assocPath, is, path, pipe, values } from 'ramda'

// import * as teActions from './reexports/te/actions.js'
// import * as ostActions from './reexports/ost/actions.js'
// import * as tradebookActions from './reexports/tradebook/actions.js'
// import * as ehActions from './reexports/eh/actions.js'
// import * as newcommonActions from './reexports/newcommon/actions.js'
export { getStore } from './modules/redux/redux'

import { setState } from './actions'
import devToolsReducer from './reducers'

// export const panelActionsDispatcher = (panelName, actionName) => {
//   return (...args) => {
//     switch (panelName) {
//
//       case "te": store.dispatch(teActions[actionName](...args)); break;
// case "ost": store.dispatch(ostActions[actionName](...args)); break;
// case "tradebook": store.dispatch(tradebookActions[actionName](...args)); break;
// case "eh": store.dispatch(ehActions[actionName](...args)); break;
// case "newcommon": store.dispatch(newcommonActions[actionName](...args)); break;
//
//       default: break
//     }
//   }
// }

export const dispatch = action => {
  getStore().dispatch(action)
}

export const panelState = (panelFieldName) => {
  if (!panelFieldName) {
    return undefined
  }

  return pipe(
    path(['panels', panelFieldName]),
    values,
    panels => panels.length > 1 ? panels: panels[0]
  )(getStore().getState())
}

export const state = () => {
  return getStore().getState()
}

export const setField = (path, value) => {
  const store =getStore()
  const state = store.getState()
  store.replaceReducer(devToolsReducer)
  store.dispatch(setState(assocPath(path, value, state)))
  // setTimeout(() => store.replaceReducer(reducer))
}