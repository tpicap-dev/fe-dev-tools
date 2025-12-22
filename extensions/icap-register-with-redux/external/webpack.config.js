import constants from '../../../shared/constants.json'

export default {
  resolve: {
    alias: {
      '@icap/app-tools$': `${constants.DEV_TOOLS_PATH}/extensions/icap-register-with-redux/external/reexport.ts`,
      redux$: 'redux' // disabling 'redux$' alias
    }
  }
}