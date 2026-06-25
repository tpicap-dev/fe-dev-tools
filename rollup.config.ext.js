import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { visualizer } from 'rollup-plugin-visualizer'
import terser from '@rollup/plugin-terser'

const constants = require(`./shared/constants.json`)

export default {
  input: './extensions/external.ts',
  output: {
    file: `external/${constants.DEV_TOOLS_EXTERNAL_DIST_PATH}/${constants.EXTERNAL_EXTENSIONS_BUNDLE_FILENAME}`,
    format: 'cjs',
    name: 'extensions',
    extend: true,
    sourcemap: true,
  },
  plugins: [
    resolve({
      extensions: ['.ts', '.js']
    }),
    commonjs(),
    json(),
    typescript({ tsconfig: './external/tsconfig.json' }),
    terser(),
    visualizer({
      filename: './external/bundle-stats/extensions.html',
    })
  ]
}