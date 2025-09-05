import constants from '../../../shared/constants.json'

export default {
  resolve: {
    alias: {
      '@ag-grid-community\/react$': `${constants.PROJECT_PATH}/dev-tools/extensions/ag-grid/ag-grid-community-layer.tsx`,
    }
  }
}