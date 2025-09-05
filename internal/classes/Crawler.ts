import Files from './Files.ts';
import {Exports} from './../types/exports.ts';
import { Utils } from './Utils/Utils.ts';
import constants from '../../shared/constants.json' 
const  { PROJECT_PATH }  = constants

export default class Crawler {
  static getExports = (panel: any, objective: String): {[key: string]: Exports} => {
    const filenames: Array<String> = Files.getPanelFilenames(panel, objective);
    const exportsObjs: Exports = {}

    for (const filename of filenames) {
      const contents = Files.readFile(filename);
      const projectRootFilename = filename.replace(PROJECT_PATH, '');
      const exports = [ ...contents.matchAll(Utils.Patterns.export) ].map(e => e[1]);
      const defaultExport = Crawler.getDefaultExport(filename, contents);
      exportsObjs[projectRootFilename] = {
        regularExports: [],
        defaultExport: '',
      }
      for (const _export of exports) {
        exportsObjs[projectRootFilename].regularExports.push(_export);
      }

      exportsObjs[projectRootFilename].defaultExport = defaultExport
    }

    return exportsObjs;
  }

  static replace = (panels: any, excludes: Array<String> = [], objective: String, pattern: RegExp, replacement: String, filter: RegExp) => {

    for (const panelShortName of Object.keys(panels)) {
      if (excludes.includes(panelShortName)) {
        continue;
      }
      const filenames: Array<String> = Files.getFilenames(panels[panelShortName].folderName, objective);
      for (const filename of filenames) {
        const contents = Files.readFile(filename);
        if (filter && filter.test(contents)) {
          continue;
        }
        Files.writeFile(filename, contents.replace(pattern, replacement));
      }
    }
  }

  static getDefaultExport = (filename: String, contents: string): String => {
    if (!/(\n|\r|^)export default/.test(contents)) {
      return null
    }
    return Utils.String.toCamelCase(Utils.filePathToFileBasename(filename));
  }
}