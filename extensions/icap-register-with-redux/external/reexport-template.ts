import { pipe } from 'ramda'

export {
  createShellApp,
  // @ts-ignore
  createApp,
  createNameSpacedKeys,
  createStream,
  shellActions,
  // @ts-ignore
  shellActionTypes,
  // @ts-ignore
  registerMqConnections,
  // @ts-ignoree
  dispatchWithPanelId,
  // @ts-ignore
  registerToolbarItem,
  isParentWindow,
} from '%PROJECT_PATH%/node_modules/@icap/app-tools/src/index.js'
import { registerWithRedux as originalRegisterWithRedux,shellSelectors as originalShellSelectors } from '%PROJECT_PATH%/node_modules/@icap/app-tools/src/index.js'
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

export const shellSelectors = {
  ...originalShellSelectors,
  permissionsSelector: () => (window as any).store.getState().permissions,
}
