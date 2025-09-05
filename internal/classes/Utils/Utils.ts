import { append, isEmpty, filter, flatten, forEach, forEachObjIndexed, insertAll, isNil, length, map, pipe, values } from 'npm:ramda@0.28.0';
import {Path} from 'https://deno.land/x/path/mod.ts';

import constants from '../../../shared/constants.json'
const  { PROJECT_PATH }  = constants
import {Exports, FileExports} from '../../types/exports.ts';
import Patterns from './Patterns.ts';
import StringUtils from './String.ts';

export class Utils {
  static String = StringUtils;
  static Patterns = Patterns;

  static createObjectiveReexports = (exportsObjs: Exports, { onlyDefaultExports } = { onlyDefaultExports: false }): String => {
    let libsImports: String = ''
    const imports: Array<String> = []
    const exports: Array<String> = []
    const defaultExports: Array<String> = []

    forEachObjIndexed((fileExports: FileExports, filename) => {
      if (isEmpty(fileExports.regularExports) && isNil(fileExports.defaultExport)) {
        return
      }

      libsImports = Utils.makeLibsImportsLines()

      imports.push(Utils.makeImportLine(filename))
      const importAlias = Utils.makeImportAlias(filename)
      if (!onlyDefaultExports) {
        forEach(regularExport => {
          exports.push(Utils.makeExportLine(exportsObjs, filename, regularExport, importAlias))
        }, fileExports.regularExports || [])
      }

      if (!isNil(fileExports.defaultExport)) {
        defaultExports.push(Utils.makeDefaultExportLine(exportsObjs, filename, fileExports.defaultExport, importAlias))
      }
    }, exportsObjs)

    return `${libsImports}\n${imports.join('\n')}\n${exports.join('\n')}\n${defaultExports.join('\n')}`
  }

  static createObjectiveImports = (panelNames: Array<String>, objective: String): String => {
    const objectiveImports: Array<String> = []
    forEach(panelName => {
      const panelObjectiveImport = `import * as ${panelName}${StringUtils.capitalize(objective)} from './reexports/${panelName}/${objective}.js'`
      objectiveImports.push(panelObjectiveImport);
    }, panelNames)

    return objectiveImports.join('\n')
  }

  static createActionsSwitchcases = (panelNames: Array<String>): String => {
    const switchCases =panelNames.map(panelName => {
      return `case "${panelName}": store.dispatch(${panelName}Actions[actionName](...args)); break;`
    })

    return switchCases.join('\n')
  }

  static makeImportAlias = (filename: String): String => {
    return Utils.String.stripNonAlphaChars(filename).toLowerCase() + 'Imports'
  }

  static makeImportLine = (filename: String): String => {
    return `import * as ${Utils.makeImportAlias(filename)} from '${filename.replace('/src/', '').replace(/\.[a-z]{2,3}$/, '')}'`
  }

  static makeExportLine = (exportsObjs: Exports, filename: String, exportName: String, importAlias: String): String => {
    const isExportNameUnique = pipe(
      values,
      map(fileExports => [...fileExports.regularExports, fileExports.defaultExport]),
      flatten,
      filter(e => e === exportName),
      length,
      n => n === 1
    )(exportsObjs)

    if (isExportNameUnique) {
      return `export const ${exportName} = prop('${exportName}', ${importAlias})`
    } else {
      return `export const ${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 6))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 5))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 4))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 3))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 2))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 1))}${StringUtils.toCamelCase(Utils.filePathToFileBasename(filename))}${StringUtils.capitalize(exportName)} = prop('${exportName}', ${importAlias})`
    }
  }

  static makeDefaultExportLine = (exportsObjs: Exports, filename: String, defaultExport: String, importAlias: String): String => {
    const isExportNameUnique = pipe(
      values,
      map(fileExports => [...fileExports.regularExports, fileExports.defaultExport]),
      flatten,
      filter(e => e === defaultExport),
      length,
      n => n === 1
    )(exportsObjs)

    if (isExportNameUnique) {
      return `export const ${defaultExport} = ${importAlias}.default`
    } else {
      return `export const ${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 6))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 5))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 4))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 3))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 2))}${StringUtils.toCamelCase(Utils.filePathToFilePathPart(filename, 1))}${StringUtils.toCamelCase(Utils.filePathToFileBasename(filename))} = ${importAlias}.default`
    }
  }

  static makeLibsImportsLines = (): String => {
    return 'import { prop } from \'ramda\''
  }

  static filePathToFileBasename = (filename: String): String => {
    const path = new Path(filename);

    return path.elements.pop().split('.')[0]
  }

  static filePathToFilePathPart = (filename: String, partTailIndex): String => {
    const path = new Path(filename);

    return path.elements[path.elements.length - partTailIndex - 1]
  }
}