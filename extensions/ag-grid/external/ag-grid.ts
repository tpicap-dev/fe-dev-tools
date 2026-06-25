import webpackConfig from './webpack.config'
import constants from '../../../shared/constants.json'
import * as fs from 'fs/promises'

export default class AgGrid {

  static webpackConfig = webpackConfig
  static async preBuild() {
    try {
      await fs.mkdir(`${constants.PROJECT_PATH}/dev-tools/extensions/ag-grid`, { recursive: true })
      await fs.copyFile(`${constants.DEV_TOOLS_PATH}/extensions/ag-grid/external/ag-grid-community-layer.tsx`, `${constants.PROJECT_PATH}/dev-tools/extensions/ag-grid/ag-grid-community-layer.tsx`);
      await fs.copyFile(`${constants.DEV_TOOLS_PATH}/extensions/ag-grid/external/grids-registry.ts`, `${constants.PROJECT_PATH}/dev-tools/extensions/ag-grid/grids-registry.ts`);
    } catch (e) {
      console.error('Could not copy ag-grid extension file')
      console.error(e)
    }
  }
}