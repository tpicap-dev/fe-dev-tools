import * as datefns from 'date-fns'
import Decimal from 'decimal.js'
import numeral from 'numeral'
import * as ramda from 'ramda'
import { Parser as CsvParser } from '@json2csv/plainjs'
import diff from '../shared/modules/diff/diff'

import Logger from './modules/logger/logger'
import Diagnostics from 'external/modules/sanitizer/diagnostics/Diagnostics'
import { stub } from './stub-generator'
import { setOnLoad } from './utils/utils'
import { clearVars, deleteVar, setVar, getVars } from './utils/vars-persistence'
import storage from '../modules/storage/external/storage'

// import sandboxApi from './sandbox/api'

export default () => console.log('dev tools')

// @ts-ignore
Error.stackTradeLimit = Infinity

if (window) {
  // for (const panelName of Object.keys(panels) as string[]) {
  //   window[panelName as any] = { ...panels[panelName as any] }
  //
  //   for(const objective of ramda.values(OBJECTIVES)) {
  //     if (objective === OBJECTIVES.actions) {
  //       import (`../shared/exports/${panelName}/actions.json`).then( module => {
  //         const actions = Object.values(module.default)
  //         if (ramda.isEmpty(actions)) {
  //           return
  //         }
  //
  //         (window[panelName as any] as any).actions = {}
  //
  //         for (const fileActions of actions) {
  //           for (const actionName of (fileActions as any)?.regularExports) {
  //             (window[panelName as any] as any).actions[actionName as any] = panelActionsDispatcher(panelName, actionName)
  //           }
  //         }
  //       })
  //     } else {
  //       import(`./reexports/${panelName}/${objective}.js`).then(module => {
  //         window[panelName as any][objective as any] = module
  //       })
  //     }
  //   }
  //
  //   (window[panelName as any] as any).state = () => panelState((panels as any)[panelName].stateFieldName)
  // }

  // (window as any).store = {
  //   dispatch,
  //   get state() { return state() },
  //   setField,
  // };
//  window.moveToSandbox = sandboxApi.moveToSandbox
  (window as any).devTools = {};
  (window as any).devTools.extensions = {};
  (window as any).r = ramda;
  (window as any).numeral = numeral;
  (window as any).decimal = Decimal;
  (window as any).d = datefns;
  (window as any).setVar = setVar;
  (window as any).deleteVar = deleteVar;
  (window as any).clearVars = clearVars;
  (window as any).diff = diff;
  (window as any).stub = stub;
  (window as any).logger = new Logger();
  (window as any).csvParser = new CsvParser({ delimiter: '\t' });
  (window as any).Diagnostics = Diagnostics;
  (window as any).setOnLoad = setOnLoad;
  (window as any).storage = storage;

  const persistent_vars = getVars();
  for (let variable of persistent_vars) {
    (window as any)[variable.name] = variable.value;
  }

  if ((window as any)?.onLoad) {
    try {
      eval((window as any)?.onLoad)()
    } catch (e) {}
  }
}
