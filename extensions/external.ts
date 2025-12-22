import { applyMiddleware, compose } from 'redux'

import MessageStorage from './message-storage/external/message-storage'
import AgGrid from './ag-grid/external/ag-grid'
import { setFieldValue } from './antd-form/external/antd-form'

import IcapRegisterWithRedux from './icap-register-with-redux/external/icap-register-with-redux'

export default {
  middlewares: compose(applyMiddleware(MessageStorage.middleware)),
  webpackConfig: [AgGrid.webpackConfig, IcapRegisterWithRedux.webpackConfig],
  preBuild: [AgGrid.preBuild, IcapRegisterWithRedux.preBuild],
  expose: { setFieldValue }
}