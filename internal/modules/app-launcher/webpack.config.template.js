const webpackConfig = require('./webpack.config')
const devToolsPath = '%DEV_TOOLS_PATH%'

const extensions = require(`${devToolsPath}/external/dist/extensions`)
const constants = require(`${devToolsPath}/shared/constants.json`)
const InjectPlugin = require(`${devToolsPath}/node_modules/webpack-inject-plugin`).default
const path = require('node:path')
const process = require('node:process')
const DevToolsPlugin = require(`${devToolsPath}/internal/modules/webpack-plugins/DevTools/DevToolsPlugin`)
const {ENTRY_ORDER} = require(`${devToolsPath}/node_modules/webpack-inject-plugin`)
const {mergeDeepRight} = require('ramda')
const devToolsScriptPath = `${devToolsPath}/external/${constants.DEV_TOOLS_EXTERNAL_DIST_PATH}/${constants.EXTERNAL_DEV_TOOLS_BUNDLE_FILENAME}`
const devToolsScriptRelativePath = path
  .relative(process.cwd(), devToolsScriptPath)
  .split('\\')
  .join('/')
console.log('dev-tools webpack config') // eslint-disable-line no-console
console.log('project path:', constants.PROJECT_PATH) // eslint-disable-line no-console
console.log('dev-tools script path:', devToolsScriptPath)
console.log(new Date().toLocaleString())
const config = {
  ...webpackConfig,
  plugins: [
    ...webpackConfig.plugins,
    new InjectPlugin(function() {
      return `import '${devToolsScriptRelativePath}';`
    }),
    new DevToolsPlugin(),
  ],
  resolve: {
    ...webpackConfig.resolve,
    alias: {
      ...webpackConfig.resolve.alias,
      redux$: `${devToolsPath}/external/${constants.DEV_TOOLS_EXTERNAL_DIST_PATH}/${constants.EXTERNAL_REDUX_BUNDLE_FILENAME}`,
    }
  }
}

if (extensions.preBuild) {
  extensions.preBuild.forEach(preBuild => preBuild())
}

if (extensions.webpackConfig) {
  module.exports = mergeDeepRight(config, extensions.webpackConfig)
} else {
  module.exports = config
}