import RequireActual2AsyncImport from '../rules/require-actual-2-async-import.ts'
import Jest2Vi from '../rules/jest-2-vi'
import DefaultExportMock from '../rules/default-export-mock'
import Require2Import from '../rules/require-2-import'
import Preset from './preset'
import { basename, extname } from 'node:path'
import IPreset from '../interfaces/IPreset'
import Logger from '../../../../shared/modules/logger/logger'
import { fileExistsSync, patchFile, pathToFilename } from '../../../utils/utils'
import Storage from '../../../../modules/storage/internal/storage'
import { isEmpty, isNil } from 'ramda'

export default class Jest2VitestPreset extends Preset implements IPreset {
  title = 'jest-2-vitest';

  prefix = 'vitest';

  description = 'Jest to Vitest';

  storage = new Storage();

  override rules = [
    new RequireActual2AsyncImport(),
    new Jest2Vi('jest', 'vi'),
    new DefaultExportMock(),
    new Require2Import(),
  ]

  constructor(storgePath?: string) {
    super()
    if (storgePath) {
      this.storage.setPath(storgePath)
    }

    this.storage.switchEngine('kv')
  }

  createFiles(paths?: string[]) {
    if (!paths) {
      throw new Error('Paths not provided')
    }

    const newPaths: string[] = [];
    (paths || []).forEach(async path => {
      const name = basename(path)
      const parts = name.split('.')
      const baseName = parts.slice(0, parts.length - 2).join('.')
      const newName = `${baseName}.vitest${extname(path)}`
      const newPath = path.replace(name, newName)
      const content = Deno.readTextFileSync(path)
      Logger.log(`Transforming ${path} to ${newName}`)
      const newContent = this.transform(content)

      if (!fileExistsSync(newPath)) {
        Logger.log(`Writing ${newName}`)
        Deno.writeTextFileSync(newPath, newContent, {create: true})
      } else {
        Logger.log(`${newName} already exists, patching file`)
        let initialContent
        try {
          initialContent = await this.storage.get(['ast', 'jest2vitest', 'files', pathToFilename(newPath)])
        } catch (e) {}

        if (isNil(initialContent) || isEmpty(initialContent)) {
          Logger.log(`Could not patch ${newName}`)
        } else {
          await patchFile(newPath, newContent, initialContent)
        }
      }
      try {
        await this.storage.store(['ast', 'jest2vitest', 'files', pathToFilename(newPath)], newContent)
      } catch (e) {
        Logger.log('Could not store file in dev-tools storage for reference')
      }
      newPaths.push(newPath)
    })

    return {
      paths: newPaths,
    }
  }
};