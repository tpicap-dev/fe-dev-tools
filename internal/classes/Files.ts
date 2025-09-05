import glob from 'npm:glob@8.0.3';
import { flatten, forEachObjIndexed, pipe, replace, values } from 'npm:ramda@0.28.0';
import { existsSync } from 'https://deno.land/std/fs/mod.ts';
import {Utils} from './Utils/Utils.ts';
import {Exports} from '../types/exports.ts';
import constants from '../../shared/constants.json' with { type: "json" }

const {
  EXPORTS_PATH,
  OBJECTIVES, OBJECTIVES_PATH,
  REDUX_OUTPUT_FILE,
  REDUX_TEMPLATE_FILE,
  REEXPORTS_PATH
} = constants

export default class Files {
  static getFilenames = (folderName: string, objective: string): Array<string> => {
    return glob.sync(Utils.Patterns.files[objective](folderName));
  }

  static getPanelFilenames = (panel: any, objective: string): Array<string> => {
    return Files.getFilenames(panel.folderName, objective);
  }

  static readFile = (filename: string): string => {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(Deno.readFileSync(filename));
  }

  static storePanelObjectiveExports = (panelName: string, objective: string, exports) => {
    if (!existsSync(`${EXPORTS_PATH}/${panelName}`)) {
      Deno.mkdirSync(`${EXPORTS_PATH}/${panelName}`)
    }

    Files.writeFile(`${EXPORTS_PATH}/${panelName}/${objective}.json`, JSON.stringify(exports));
  }

  static storePanelObjectiveReexports = (panelName: string, objective: string, reexports: string) => {
    if (!existsSync(`${REEXPORTS_PATH}/${panelName}`)) {
      Deno.mkdirSync(`${REEXPORTS_PATH}/${panelName}`)
    }

    Files.writeFile(`${REEXPORTS_PATH}/${panelName}/${objective}.js`, reexports)
  }

  static storeObjectiveReexports = (objective: string, reexports: string) => {
    if (!existsSync(`${REEXPORTS_PATH}`)) {
      Deno.mkdirSync(`${REEXPORTS_PATH}`)
    }

    Files.writeFile(`${REEXPORTS_PATH}/${objective}.js`, reexports)
  }

  static writeFile = (filename: string, content: string): void => {
    const encoder = new TextEncoder();
    Deno.writeFileSync(filename, encoder.encode(content), { create: true });
  }
  //
  // static storeObjectives = (objectives: Array<string>) => {
  //   Files.writeFile(`${OBJECTIVES_PATH}/objectives.json`, JSON.stringify(objectives))
  // }

  static storeExports = (allExportsObjs: any) => {
    console.log('storing exports json files');
    forEachObjIndexed((panelExports, panelName) => {
      forEachObjIndexed((objectiveExports, objective) => {
        Files.storePanelObjectiveExports(panelName, objective, objectiveExports)
      }, panelExports)
    }, allExportsObjs)
  }

  static storeReexports = (allExportsObjs: {[key: string]: Exports}) => {
    console.log('storing reexports js files')
    let objectivesExports = {}
    forEachObjIndexed((panelExports, panelName) => {
      forEachObjIndexed((panelObjectiveExports, objective) => {
        const reexports = Utils.createObjectiveReexports(panelObjectiveExports)
        objectivesExports[objective] = objectivesExports[objective] ? objectivesExports[objective] : {}
        Files.storePanelObjectiveReexports(panelName, objective, reexports)
        objectivesExports[objective] = { ...objectivesExports[objective], ...panelObjectiveExports }
      }, panelExports)
    }, allExportsObjs)

    forEachObjIndexed((objectiveExports, objective) => {
      let reexports
      reexports = objective === OBJECTIVES.components ? Utils.createObjectiveReexports(objectiveExports, { onlyDefaultExports: true }) : Utils.createObjectiveReexports(objectiveExports)
      Files.storeObjectiveReexports(objective, reexports)
    }, objectivesExports)
  }

  static injectActions = (allExportsObjs: {[key: string]: Exports}) => {
    const template = Files.readFile(REDUX_TEMPLATE_FILE);
    const panelNames = Object.keys(allExportsObjs);
    const actionsImports: string = Utils.createObjectiveImports(panelNames, OBJECTIVES.actions);
    const actionsSwitchCases: string = Utils.createActionsSwitchcases(panelNames);

    const fileContent = pipe(
      replace('/* ACTIONS_IMPORT */', actionsImports),
      replace('/* ACTIONS_SWITCH */', actionsSwitchCases)
    )(template);

    Files.writeFile(REDUX_OUTPUT_FILE, fileContent);
  }
}