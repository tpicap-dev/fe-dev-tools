'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('rollup-plugin-typescript2');
var json = require('@rollup/plugin-json');
var constants$1 = require('../../../shared/constants.json');
var fs = require('fs/promises');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);

var webpackConfig = {
  resolve: {
    alias: {
      '@icap/app-tools$': `${constants$1.DEV_TOOLS_PATH}/extensions/icap-register-with-redux/external/reexport.ts`,
      redux$: 'redux' // disabling 'redux$' alias
    }
  }
};

class IcapRegisterWithRedux {

  static webpackConfig = webpackConfig
  static async preBuild() {
    try {
      let content = await fs__namespace.readFile(`${constants$1.DEV_TOOLS_PATH}/extensions/icap-register-with-redux/external/reexport-template.ts`, { encoding: 'utf8' });
      content = content.replaceAll('%PROJECT_PATH%', constants$1.PROJECT_PATH);
      await fs__namespace.writeFile(`${constants$1.DEV_TOOLS_PATH}/extensions/icap-register-with-redux/external/reexport.ts`, content);
    } catch (e) {
      console.error('Could not copy icap-register-with-redux extension file');
      console.error(e);
    }
  }
}

const constants = require(`../../../shared/constants.json`);

try {
  IcapRegisterWithRedux.preBuild();
} catch (e) {
  console.error('icap-register-with-redux: Could not run prebuild');
  console.error(e);
}

var rollup_config = {
  input: './extensions/icap-register-with-redux/external/reexport.ts',
  output: {
    file: `./extensions/icap-register-with-redux/external/dist/${constants.EXTERNAL_REDUX_BUNDLE_FILENAME}`,
    format: 'es',
    name: 'redux-toolkit',
    extend: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './external/tsconfig.json' }),
  ]
};

exports.default = rollup_config;
