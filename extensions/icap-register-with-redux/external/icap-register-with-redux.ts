import webpackConfig from './webpack.config'
import constants from '../../../shared/constants.json'
import * as fs from 'node:fs/promises'

export default class IcapRegisterWithRedux {

  static webpackConfig = webpackConfig
  static async preBuild() {
    try {
      let content = await fs.readFile(`${constants.DEV_TOOLS_PATH}/extensions/icap-register-with-redux/external/reexport-template.ts`, { encoding: 'utf8' })
      content = content.replaceAll('%PROJECT_PATH%', constants.PROJECT_PATH)
      await fs.writeFile(`${constants.DEV_TOOLS_PATH}/extensions/icap-register-with-redux/external/reexport.ts`, content)
    } catch (e) {
      console.error('Could not copy icap-register-with-redux extension file')
      console.error(e)
    }
  }
}