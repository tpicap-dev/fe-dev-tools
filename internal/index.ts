import { isEmpty, isNil } from 'npm:ramda@0.28.0';
import Crawler from './classes/Crawler.ts';
import * as constants from '../shared/constants.json'
const  { OBJECTIVES }  = constants
import panels from '../shared/panels.ts';
import Files from './classes/Files.ts';

let objectives;
const args = Deno.args;

const objectivesArg = args.find( arg => arg.startsWith('--objectives='))?.split('=')[1]?.split(',').filter(objective => Object.values(OBJECTIVES).includes(objective));

if (isEmpty(objectivesArg) || isNil(objectivesArg)) {
  objectives = Object.values(OBJECTIVES);
} else {
  objectives = objectivesArg;
}


if (objectives !== undefined) {
  const allExportsObjs = {};

  for (const panel of Object.values(panels)) {
    allExportsObjs[panel.shortName] = {};
    console.log('getting exports for ' + panel.shortName);
    for (const objective of objectives) {
      console.log('\t', objective);
      const exportsObjs =Crawler.getExports(panel, objective);
      allExportsObjs[panel.shortName][objective] = exportsObjs;
    }
  }

  Files.storeExports(allExportsObjs);
  Files.storeReexports(allExportsObjs);

  if (objectives.includes(OBJECTIVES.actions)) {
    Files.injectActions(allExportsObjs);
  }
}