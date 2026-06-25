import constants from '../../../../shared/constants.json' with { type: "json" }

export const getProjectInfo = async () => {
  let bundleStats
  try {
    bundleStats = await Deno.stat(`${constants.PROJECT_PATH}/${constants.DIST_PATH}/${constants.BUNDLE_FILE_NAME}`)
  }catch (e) {
    bundleStats = await Deno.stat(`${Deno.cwd()}/${constants.DIST_PATH}/${constants.BUNDLE_FILE_NAME}`)
  }

  return {
    bundleMTime: bundleStats?.mtime?.toISOString()
  }
}