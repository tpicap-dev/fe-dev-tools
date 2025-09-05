import { applyMiddleware, compose } from 'redux'

import MessageStorage from './message-storage/external/message-storage'
import AgGrid from './ag-grid/external/ag-grid'

export default {
  middlewares: compose(applyMiddleware(MessageStorage.middleware)),
  webpackConfig: AgGrid.webpackConfig,
  preBuild: [AgGrid.preBuild]
}