import constants from '../../../shared/constants.json'

export default {
  resolve: {
    alias: {
      'exceljs$': `${constants.DEV_TOOLS_PATH}/extensions/exceljs/external/reexport.ts`,
    }
  }
}