import { applyMiddleware, compose } from 'redux'

import AgGrid from './ag-grid/external/ag-grid'
import { setFieldValue } from './antd-form/external/antd-form'
import fifx from './fifx/external/fifx'

import IcapRegisterWithRedux from './icap-register-with-redux/external/icap-register-with-redux'
import ExcelJs from './exceljs/external/exceljs'

export default {
  middlewares: null,
  webpackConfig: [AgGrid.webpackConfig, IcapRegisterWithRedux.webpackConfig, ExcelJs.webpackConfig],
  preBuild: [AgGrid.preBuild, IcapRegisterWithRedux.preBuild],
  expose: { fifx, setFieldValue }
}