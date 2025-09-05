import constants from '../../../shared/constants.json' with { type: "json" }
import registry from './registry.ts'

import { filter, fromPairs, mergeRight, toPairs } from 'npm:ramda'

export const syncDependencies = () => {
  try {
    const decoder = new TextDecoder('utf-8')
    const projetPackageJsonEncoded = Deno.readFileSync(`${constants.PROJECT_PATH}/package.json`)
    const projetPackageJson = JSON.parse(decoder.decode(projetPackageJsonEncoded))
    const projectPackageJsonDependencies = projetPackageJson.dependencies
    const projectPackageJsonDevDependencies = projetPackageJson.devDependencies
    const { devDeps, deps } = filterDependencies(projectPackageJsonDevDependencies, projectPackageJsonDependencies)

    const devToolsPackageJsonEncoded = Deno.readFileSync(`${constants.DEV_TOOLS_PATH}/package.json`)
    const devToolsPackageJson = JSON.parse(decoder.decode(devToolsPackageJsonEncoded))
    const devToolsPackageJsonDependencies = mergeRight(devToolsPackageJson.dependencies, deps, devDeps)

    const encoder = new TextEncoder()
    Deno.writeFileSync(`${constants.DEV_TOOLS_PATH}/package.json`, encoder.encode(JSON.stringify({ ...devToolsPackageJson, dependencies: devToolsPackageJsonDependencies }, null, 2)))
  } catch (e) {
    console.error(e)
  }
}

const filterDependencies = (devDeps, deps) => {
  const devDepsPairs = toPairs(devDeps)
  const depsPairs = toPairs(deps)
  const filteredDevDepsPairs = filter((dep) => registry.includes(dep[0]), devDepsPairs)
  const filteredDepsPairs = filter((dep) => registry.includes(dep[0]), depsPairs)
  return {
    devDeps: fromPairs(filteredDevDepsPairs),
    deps: fromPairs(filteredDepsPairs),
  }
}
