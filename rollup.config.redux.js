import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'

const constants = require(`./shared/constants.json`)

export default {
  input: './external/modules/redux/redux.ts',
  output: {
    file: `external/${constants.DEV_TOOLS_EXTERNAL_DIST_PATH}/${constants.EXTERNAL_REDUX_BUNDLE_FILENAME}`,
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