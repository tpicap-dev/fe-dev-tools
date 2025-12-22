import { pipe } from 'ramda'

export {
  createShellApp,
  createApp,
  createNameSpacedKeys,
  createStream,
  shellSelectors,
  shellActions,
  shellActionTypes,
  registerMqConnections,
  dispatchWithPanelId,
  registerToolbarItem,
  isParentWindow,
} from 'D:/Users/m_botezatu/projects/fifx-client/node_modules/@icap/app-tools/src/index.js'
import { registerWithRedux as originalRegisterWithRedux } from 'D:/Users/m_botezatu/projects/fifx-client/node_modules/@icap/app-tools/src/index.js'
import devToolsStore from '../../../external/modules/redux/store'
import extStore from './store'

let stateLocal = {}

export const registerWithRedux = ({APP_ID}) => {
  let store = originalRegisterWithRedux({APP_ID})
  store = pipe(
    devToolsStore,
    extStore
  )(store);

  (window as any).store = store

  return store
}
