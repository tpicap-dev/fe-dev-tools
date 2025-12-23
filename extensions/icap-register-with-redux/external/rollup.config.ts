import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import IcapRegisterWithRedux from './icap-register-with-redux.ts'

const constants = require(`../../../shared/constants.json`)

try {
  IcapRegisterWithRedux.preBuild()
} catch (e) {
  console.error('icap-register-with-redux: Could not run prebuild')
  console.error(e)
}

export default {
  input: './extensions/icap-register-with-redux/external/reexport.ts',
  output: {
    file: `./extensions/icap-register-with-redux/external/dist/${constants.EXTERNAL_REDUX_BUNDLE_FILENAME}`,
    format: 'cjs',
    name: 'redux-toolkit',
    extend: true,
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './external/tsconfig.json' }),
  ]
}