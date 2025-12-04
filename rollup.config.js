import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import postcss from 'rollup-plugin-postcss'

const constants = require(`./shared/constants.json`)

export default {
  input: './external/index.ts',
  output: {
    file: `external/${constants.DEV_TOOLS_EXTERNAL_DIST_PATH}/${constants.EXTERNAL_DEV_TOOLS_BUNDLE_FILENAME}`,
    format: 'iife',
    name: 'dev-tools',
    extend: true,
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './external/tsconfig.json' }),
    postcss({
      extract: false,
      minimize: true,
      sourceMap: true,
    })
  ]
}