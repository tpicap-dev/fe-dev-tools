import devToolsMiddleware from '../../../external/modules/redux/middleware'
import { modifyPath } from 'ramda'

let stateLocal = {}

export default (store: any) => {
  store.subscribe(() => {
    stateLocal = store.getState()
  })

  store.addMiddleware?.(devToolsMiddleware)

  return {
    ...store,
    get state() { return stateLocal },
    setField: (path: string, value: any) => {
      const state = store.getState()
      const pathArr = String(path).split('.').map(segment => isNaN(segment as any) ? segment : Number(segment))
      stateLocal = modifyPath(pathArr, () => value, state)
    },
    getState: () => stateLocal,
    setState: (state) => stateLocal = state
  }
}