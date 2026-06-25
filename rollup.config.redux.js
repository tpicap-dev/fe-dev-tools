import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import { visualizer } from 'rollup-plugin-visualizer'

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
    typescript({ tsconfig: './external/tsconfig.json', include: ['external/**/*.ts'] }),
    commonjs(),
    resolve(),
    json(),
    terser(),
    visualizer({
      filename: './external/bundle-stats/redux.html',
    })
  ]
}