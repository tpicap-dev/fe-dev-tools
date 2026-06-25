import { getVar, reviveVar, setVar, stringifyVar } from '../../../external/utils/vars-persistence'
import { isEmpty } from 'ramda'

export default class ReduxLogger {
  static get isOn() {
    return Boolean(getVar('reduxLogger'))
  }

  static get callbacks() {
    return (getVar('reduxLoggerCallbacks') || []).map(reviveVar)
  }

  static on() {
    setVar('reduxLogger', true)
  }

  static off() {
    setVar('reduxLogger', false)
  }

  static exclude(actionType: string) {
    if (!actionType) {
      return
    }
    if (!getVar('reduxLoggerExclude')) {
      setVar('reduxLoggerExclude', [])
    }

    setVar('reduxLoggerExclude', [...getVar('reduxLoggerExclude'), String(actionType).toLowerCase()])
  }

  static include(actionType: string) {
    if (!actionType) {
      return
    }

    if (!getVar('reduxLoggerExclude')) {
      setVar('reduxLoggerExclude', [])
      return
    }

    const excludes = getVar('reduxLoggerExclude')

    setVar('reduxLoggerExclude', excludes.filter(e => !String(e).includes(String(actionType).toLowerCase())))
  }

  static addCallback(callback: any) {
    const callbacks = getVar('reduxLoggerCallbacks') || []
    if (isEmpty(callbacks)) {
      setVar('reduxLoggerCallbacks', [])
    }

    setVar('reduxLoggerCallbacks', [...callbacks, stringifyVar(callback)])
  }

  static removeCallbacks() {
    setVar('reduxLoggerCallbacks', [])
  }

  static middleware (store) {
    return next =>
      action => {
        if (!ReduxLogger.isOn) {
          return next(action)
        }

        if (getVar('reduxLoggerExclude')?.some(exclType => String(action.type).toLowerCase().includes(exclType))) {
          return next(action)
        }

        const { type } = action

        console.groupCollapsed(...(action.error || action.err ? [`%c${type}`, 'color: red'] : [type]))
        console.info('Dispatching', action)
        console.log('Next state', store.getState())
        // @ts-ignore
        console.groupEnd(type)


        ReduxLogger.callbacks.forEach(callback => { try { callback?.(action) } catch (e) { console.error(e) } })

        return next(action)
      }
  }
}