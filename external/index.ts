import * as datefns from 'date-fns'
import Decimal from 'decimal.js'
import numeral from 'numeral'
import * as ramda from 'ramda'
import { Parser as CsvParser } from '@json2csv/plainjs'

import './style.less'

import Logger from './modules/logger/logger'
import Diagnostics from 'external/modules/sanitizer/diagnostics/Diagnostics'
import { stub } from './stub-generator'
import { setOnLoad } from './utils/utils'
import { clearVars, deleteVar, setVar, getVars } from './utils/vars-persistence'
import storage from '../modules/storage/external/storage'
import * as _ from './modules/ladash/ladash'
import DemoTools from './modules/demo-tools/demo-tools'
import extensions from '../extensions/external'

// import sandboxApi from './sandbox/api'

export default () => console.log('dev tools')

// @ts-ignore
Error.stackTradeLimit = Infinity

if (window) {
  (window as any).devTools = {};
  (window as any).devTools.extensions = {};
  (window as any).r = ramda;
  (window as any).numeral = numeral;
  (window as any).decimal = Decimal;
  (window as any).d = datefns;
  (window as any).setVar = setVar;
  (window as any).deleteVar = deleteVar;
  (window as any).clearVars = clearVars;
  (window as any).stub = stub;
  (window as any).logger = new Logger();
  (window as any).csvParser = new CsvParser({ delimiter: '\t' });
  (window as any).Diagnostics = Diagnostics;
  (window as any).setOnLoad = setOnLoad;
  (window as any).storage = storage;
  (window as any).__ = _;
  (window as any).demoTools = DemoTools

  const persistent_vars = getVars();
  for (let variable of persistent_vars) {
    (window as any)[variable.name] = variable.value;
  }

  if ((window as any)?.onLoad) {
    try {
      eval((window as any)?.onLoad)()
    } catch (e) {}
  }

  if (extensions?.expose) {
    for (let exposeKey in extensions.expose) {
      (window as any)[exposeKey] = extensions.expose[exposeKey]
    }
  }
}
