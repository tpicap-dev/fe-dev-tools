
import WrappingCalls from '../rules/wrapping-calls'
import Preset from './preset'
import { basename, extname, resolve } from 'node:path'
import IPreset from '../interfaces/IPreset'
import Logger from '../../../../shared/modules/logger/logger'
import { fileExistsSync, patchFile, pathToFilename } from '../../../utils/utils'
import { isEmpty, isNil } from 'ramda'

export default class WrappingcallsPreset extends Preset implements IPreset {
  title = 'wrapping-calls';

  description = 'Jest to Vitest';

  override rules = []

  constructor(paths, f1, f2) {
    super()
    this.rules.push(new WrappingCalls(f1, f2))

    if (!paths) {
      throw new Error('Paths not provided')
    }

    (paths || []).forEach(async path => {
      const content = Deno.readTextFileSync(path)
      const newContent = this.transform(content, path)
      Deno.writeTextFileSync(resolve(path), newContent, {create: true})
    })
  }
}