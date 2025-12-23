import constants from '../../../../shared/constants.json' with { type: "json" }

export const getProjectInfo = async () => {
  const bundleStats = await Deno.stat(`${constants.PROJECT_PATH}/${constants.DIST_PATH}/${constants.BUNDLE_FILE_NAME}`)

  return {
    bundleMTime: bundleStats.mtime.toISOString()
  }
}