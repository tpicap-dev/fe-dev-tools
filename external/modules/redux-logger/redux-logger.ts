import { getVar, setVar } from '../../../external/utils/vars-persistence'

export default class ReduxLogger {
  static get isOn() {
    return Boolean(getVar('reduxLogger'))
  }

  static on() {
    setVar('reduxLogger', true)
  }

  static off() {
    setVar('reduxLogger', false)
  }

  static middleware (store) {
    return next =>
      action => {
        if (!ReduxLogger.isOn) {
          return next(action)
        }

        const { type } = action

        const timer = Date.now()
        const result = next(action)
        const reducerTime = `Reducer ${Date.now() - timer}ms`

        console.groupCollapsed(...(action.error || action.err ? [`%c${type}`, 'color: red'] : [type]))
        console.info('Dispatching', action)
        console.log('Next state', store.getState())
        console.log(`${reducerTime}`)
        console.log(new Date().toUTCString())
        // @ts-ignore
        console.groupEnd(type)

        return result
      }
  }
}