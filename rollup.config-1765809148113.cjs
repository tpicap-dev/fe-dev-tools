'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('rollup-plugin-typescript2');
var json = require('@rollup/plugin-json');

const constants = require(`./shared/constants.json`);

var rollup_config_ext = {
  input: './extensions/external.ts',
  output: {
    file: `external/${constants.DEV_TOOLS_EXTERNAL_DIST_PATH}/${constants.EXTERNAL_EXTENSIONS_BUNDLE_FILENAME}`,
    format: 'cjs',
    name: 'extensions',
    extend: true,
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './external/tsconfig.json' }),
  ]
};

exports.default = rollup_config_ext;
