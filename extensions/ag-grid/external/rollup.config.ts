import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

const constants = require(`../../../shared/constants.json`)

export default {
  input: './extensions/ag-grid/external/ag-grid-community-layer.tsx',
  output: {
    file: `./extensions/ag-grid/external/dist/ag-grid-layer.js`,
    format: 'es',
    name: 'ag-grid-layer',
  },
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js']
    }),
    commonjs(),
    json(),
    typescript({ tsconfig: './external/tsconfig.json', include: ['extensions/**/*.tsx'] }),
    terser(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.tsx']
    }),
  ],
  external: ['react']
}