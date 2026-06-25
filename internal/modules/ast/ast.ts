import { parse } from 'https://deno.land/std/flags/mod.ts';
import IArguments from './interfaces/IArguments.ts';
import { expandGlob } from 'https://deno.land/std/fs/mod.ts';
import * as path from 'node:path'
import Jest2VitestPreset from './presets/jest-2-vitest.ts'
import Logger from '../../../shared/modules/logger/logger.ts'
import constants from '../../../shared/constants.json' with { type: "json" }
import * as fs from 'node:fs/promises'
import { runSh } from '../../utils/utils.ts'
import WrappingcallsPreset from './presets/wrapping-calls'

const args: IArguments = parse(Deno.args);

if (args.help) {
  try {
    let helpContent = await fs.readFile(`${constants.DEV_TOOLS_PATH}/internal/modules/ast/help.txt`, {encoding: 'utf8'})
    console.log(helpContent);
    Deno.exit(0)
  } catch (e) {
    console.error(e)
    Deno.exit(1)
  }
}

if (args.verbose) {
  Logger.live = true;
  Logger.prefix = 'AST'
}

let argsPath = args.path || './'

if (!args.pattern) {
  throw new Error('Pattern is required')
}

if (!args.preset) {
  throw new Error('Preset is required')
}

const paths = []

try {
  // @ts-ignore
  for await (const entry of expandGlob(path.resolve(argsPath, args.pattern))) paths.push(entry.path)
} catch (e) {
  console.error(e)
}

switch (args.preset) {
  case 'jest-2-vitest': {
    const jest2vitest = new Jest2VitestPreset(args.storagePath)
    if (!paths.length) throw new Error('No files found for pattern: ' + args.pattern + ' in path: ' + argsPath + ' with preset: ' + args.preset + '.')
    Logger.log('Found ' + paths.length + ' files for pattern: ' + args.pattern + ' in path: ' + argsPath + ' with preset: ' + args.preset + '.')
    const { paths: newPaths } = jest2vitest.createFiles(paths);
    if(args.runTests) {
      const projectPath = args.projectPath || constants.PROJECT_PATH
      const relativePaths = newPaths.map(path1 => path.relative(projectPath, path1).replace(/\\/g, '/'))
      console.log('Running tests for:\n', relativePaths.join('\n'))
      const testsContent =await runSh(`npx vitest ${relativePaths.join(' ')}`, projectPath)
      Logger.log(testsContent)
    }
    break;
  }
  case 'wrapping-calls': {
    if (!paths.length) throw new Error('No files found for pattern: ' + args.pattern + ' in path: ' + argsPath + ' with preset: ' + args.preset + '.')
    if (!args.f1) {
      throw new Error('Function 1 is not passed as f1')
    }

    new WrappingcallsPreset(paths, args.f1, args.f2 || args.f1)
    break;
  }
  default:
    const jest2vitest = new Jest2VitestPreset()
    jest2vitest.createFiles(paths);
}