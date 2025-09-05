const constants = require(`../../../../shared/constants.json`)
const fs = require('fs')

const formatFileSize = (fileSize) => {
  if (fileSize < 1048576) {
    return (fileSize / 1024) + ' Kb'
  } else if (fileSize < 1073741824) {
    return (fileSize / 1048576) + ' Mb'
  }

  return fileSize + 'b'
}

module.exports = class DevToolsPlugin {
  constructor() {}
  apply(compiler) {
    compiler.hooks./*afterEmit*/afterCompile.tap('DevToolsPlugin', () => {
      const bundlePath = `${constants.PROJECT_PATH}/${constants.DIST_PATH}/${constants.BUNDLE_FILE_NAME}`
      setTimeout(() => {
        try{
          console.log('Bundle size:', formatFileSize(fs.statSync(bundlePath).size))
        }catch(e) { console.log(`Couldn\'t get stats for bundle ${bundlePath}`)}
        console.log(`\x1b[1mCompiled at ${new Date().toLocaleString()}\x1b[0m`)
      }, 2000);
    })
  }
}