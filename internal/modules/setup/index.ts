import { existsSync } from 'https://deno.land/std@0.212.0/fs/exists.ts'
import Patterns from '../../classes/Utils/Patterns.ts'
import constants from '../../../shared/constants.json' with { type: "json" };

let isProjectPathValid = false
let isDistPathValid = false
let isSrcPathValid = false
let isBundleFileNameValid = false
let projectPath: string | null
let distPath: string | null
let srcPath: string | null
let bundleFileName: string | null
let devToolsPath: string


try {
  devToolsPath = (Deno.cwd().toLowerCase() as string).replace(/\\/g,'/')
}catch(e) { console.log(e); Deno.exit(1); }

do {
  projectPath = prompt('Enter Project Path:')
  if (existsSync(projectPath || '')) {
    isProjectPathValid = true
  } else {
    console.log('Provided path does not exist')
  }
} while(!isProjectPathValid)

do {
  distPath = prompt('Enter Dist Path relative to Project Path(default is "dist"):')
  if (!distPath) {
    distPath = constants.DIST_PATH
  }
  if (existsSync(`${projectPath}/${distPath}`)) {
    isDistPathValid = true
  } else {
    console.log('Provided path does not exist')
  }
} while(!isDistPathValid)

do {
  srcPath = prompt('Enter src Path relative to Project Path(default is "src"):')
  if (!srcPath) {
    srcPath = constants.SRC_PATH
  }
  if (existsSync(`${projectPath}/${srcPath}`)) {
    isSrcPathValid = true
  } else {
    console.log('Provided path does not exist')
  }
} while(!isSrcPathValid)

do {
  bundleFileName = prompt('Enter Bundle Filename:')
  if (Patterns.filename.test(bundleFileName || '')) {
    isBundleFileNameValid = true
  } else {
    console.log('Invalid filename')
  }
} while(!isBundleFileNameValid)

try {
  const encoder = new TextEncoder();
  Deno.writeFileSync('internal/constants.sh', encoder.encode(
    `#!/bin/bash

PROJECT_PATH="${projectPath}"
SRC_PATH="${srcPath}"
DEV_TOOLS_PATH="${devToolsPath}"`
  ), { create: true });

  Deno.writeFileSync(
    'shared/constants.json',
    encoder.encode(
      JSON.stringify({
        ...constants,
        PROJECT_PATH: projectPath,
        DEV_TOOLS_PATH: devToolsPath,
        SRC_PATH: srcPath,
        BUNDLE_FILE_NAME: bundleFileName,
      }),
    ),
    { create: true }
  )
}catch(e) {
  console.log(e);
  Deno.exit(1)
}

