const constants = require(`../../../shared/constants.json`)
const InjectPlugin = require('webpack-inject-plugin').default
const path = require('node:path')
const process = require('node:process')
const DevToolsPlugin = require('../webpack-plugins/DevTools/DevToolsPlugin')

const devToolsScriptPath = path.resolve(path.dirname(__filename), '../../../external/dist/dev-tools.js')
const devToolsScriptRelativePath = path
  .relative(process.cwd(), devToolsScriptPath)
  .split('\\')
  .join('/')
console.log('dev-tools webpack config') // eslint-disable-line no-console
console.log('project path:', constants.PROJECT_PATH) // eslint-disable-line no-console
console.log('dev-tools script path relative to project path:', devToolsScriptRelativePath)
console.log(new Date().toLocaleString())
// function exclude(test) {
//   const nm = test.lastIndexOf('node_modules')
//
//   if (nm > -1) {
//     const icap = test.lastIndexOf('@icap')
//     const devTools = test.lastIndexOf('dev-tools')
//
//     if (icap < nm && devTools < nm) return true
//   }
//
//   return false
// }
// module.exports = Object.assign(webpackConfig, {
//   ...webpackConfig,
//   output: {
//     ...webpackConfig.output,
//     devtoolNamespace: 'f2',
//     chunkFilename: '[name].js',
//     publicPath: '/~local~/dist/',
//   },
//   module: {
//     ...webpackConfig.module,
//     rules: webpackConfig.module.rules.map(r => String(r.test) === String(/\.tsx?$/) ? { ...r, exclude } : r)
//   },
//   context: constants.PROJECT_PATH,
//   plugins: [
//     ...webpackConfig.plugins
//   ]
// })
const config = {
  context: constants.PROJECT_PATH,
  plugins: [
    new InjectPlugin(function() {
      return `import '${devToolsScriptRelativePath}';`
    }),
    new DevToolsPlugin()
  ]
}

module.exports = config