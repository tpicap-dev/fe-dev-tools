import * as ramda from 'ramda'
import { Parser as CsvParser } from '@json2csv/plainjs'

import './style.less'

import Logger from 'shared/modules/logger/logger'
import { stub } from './stub-generator'
import { setOnLoad } from './utils/utils'
import { clearVars, deleteVar, setVar, getVars } from './utils/vars-persistence'
import * as _ from './modules/ladash/ladash'
import DemoTools from './modules/demo-tools/demo-tools'
import extensions from '../extensions/external'
import sh from '../modules/sh/external/sh'
import overrides from './modules/overrides/overrides'
import Telemetry from './modules/performance-tools/telemetry'

// import sandboxApi from './sandbox/api'

export default () => console.log('dev tools')

// @ts-ignore
Error.stackTradeLimit = Infinity

overrides()

if (window) {
  (window as any).devTools = {};
  (window as any).devTools.extensions = {};
  (window as any).r = ramda;
  (window as any).setVar = setVar;
  (window as any).deleteVar = deleteVar;
  (window as any).clearVars = clearVars;
  (window as any).stub = stub;
  (window as any).logger = Logger;
  (window as any).csvParser = new CsvParser({ delimiter: '\t' });
  (window as any).setOnLoad = setOnLoad;
  (window as any).__ = _;
  (window as any).demoTools = DemoTools;
  (window as any).getVars = getVars;
  (window as any).sh = sh;
  (window as any).telemetry = Telemetry;

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
