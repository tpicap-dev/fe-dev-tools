import { any, isEmpty, isNil, join, map, path, pipe } from 'ramda'
import { options } from 'external/modules/demo-tools/demo'

import './style.less'

export interface IConsoleOptions {
  override?: boolean;
  style?: any;
  logTypes?: Array<'log' | 'info' | 'warn' | 'error'>
}

export const defaultConsoleOptions: IConsoleOptions = {
  override: false,
  style: {},
  logTypes: ['log', 'info'],
}

export default class Console {
  static initialized = false;
  static area = null;
  static eventTypes = {};
  static originalConsole = null;

  static init() {
    Console.initialized = true;

    Console.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      clear: console.clear.bind(console),
      info: console.info.bind(console),
      groupCollapsed: console.groupCollapsed.bind(console),
      groupEnd: console.groupEnd.bind(console),
    };

    if (options.consoleOptions.override) {
      console.groupCollapsed = () => null

      console.groupEnd = () => null
    }

    console.log = (...args) => {
      if (options.consoleOptions.logTypes.includes('log')) {
        Console.write('log', args);
      }

      if (!options.consoleOptions.override) {
        Console.originalConsole.log(...args)
      }
    };

    console.info = (...args) => {
      if (options.consoleOptions.logTypes.includes('info')) {
      Console.write('info', args);
      }

      if (!options.consoleOptions.override) {
        Console.originalConsole.info(...args)
      }
    };

    console.warn = (...args) => {
      if (options.consoleOptions.logTypes.includes('warn')) {
        Console.write('warn', args);
      }

      if (!options.consoleOptions.override) {
        Console.originalConsole.warn(...args)
      }
    };

    console.error = (...args) => {
      if (options.consoleOptions.logTypes.includes('error')) {
        Console.write('error', args);
      }

      if (!options.consoleOptions.override) {
        Console.originalConsole.error(...args)
      }
    };

    console.clear = () => {
      Console.area.querySelector('.demo-tools.console .logs').innerHTML = '';

      if (!options.consoleOptions.override) {
        Console.originalConsole.clear()
      }
    };

    window.addEventListener('Demo:OptionsChanged', Console.handleDemoOptionsChanged)

    Console.show();
  }

  static setElement() {
    if (!Console.initialized) {
      return;
    }

    Console.area = document.createElement('div');
    Console.area.classList.add('demo-tools');
    Console.area.classList.add('console');

    if (options.consoleOptions.style) {
      Object.assign(Console.area.style, options.consoleOptions.style)
    }

    Console.area.appendChild(Console.getTopbarElement());
    Console.area.appendChild(Console.getLogsElement());
  }

  static getTopbarElement() {
    const topbar = document.createElement('div');
    const title = document.createElement('span');
    title.textContent = 'Custom Console';
    const filterInput = document.createElement('input');
    filterInput.placeholder = 'Filter logs...';
    filterInput.classList.add('filter-input');
    const pathInput = document.createElement('input');
    pathInput.placeholder = 'Path...';
    pathInput.classList.add('path-input');
    topbar.appendChild(title);
    topbar.appendChild(filterInput);
    topbar.appendChild(pathInput);
    topbar.classList.add('topbar');
    return topbar;
  }

  static getLogsElement() {
    const logs = document.createElement('div');
    logs.classList.add('logs');
    return logs
  }

  static show() {
    if (!Console.area) {
      Console.setElement();
    }

    document.body.prepend(Console.area); // prepend is used in order to have constant xPath, appendChild would not work
  }

  static write(type, args) {
    const line = document.createElement('div');
    const filtervalue = Console.area.querySelector('.demo-tools.console .filter-input')?.value?.toLowerCase();
    const pathValue = Console.area.querySelector('.demo-tools.console .path-input')?.value;

    if (!any((arg) => {
      if (filtervalue) {
        return JSON.stringify(arg)?.toLowerCase().includes(filtervalue)
      } else {
        return true
      }
    }, args)) {
      return
    }
    const html = pipe(
      map(arg => {
        if (typeof arg === 'object') {
          if (pathValue) {
            return JSON.stringify(path(pathValue.split('.'), arg))
          } else {
            const obj: any = {}
            for(const key in arg) {
              obj[key] = arg[key]?.toString()
            }
            return JSON.stringify(obj)
          }
        } else {
          return String(arg)
        }
      }),
      map(part => `<div style="${part.length > 30 ? 'white-space: normal' : 'white-space: nowrap'}">${part}</div>`),
      join('')
    )(args)

    if (isNil(html) || isEmpty(html)) {
      return
    }

    line.innerHTML = `<div style="white-space: nowrap">[${type.toUpperCase()}]</div>${html}`;
    line.classList.add('log-line');

    Console.area.querySelector('.logs').appendChild(line);

    // Auto-scroll
    Console.area.querySelector('.logs').scrollTop = Console.area.querySelector('.logs').scrollHeight;
  }

  static refresh() {
    Console.destroy()
    Console.init()
  }

  static handleDemoOptionsChanged() {
    Console.refresh()
  }

  static destroy() {
    Console.area?.remove()
    Console.area = null

    if (Console.originalConsole) {
      console.log = Console.originalConsole.log;
      console.warn = Console.originalConsole.warn;
      console.error = Console.originalConsole.error;
      console.clear = Console.originalConsole.clear;
      console.info = Console.originalConsole.info;
      console.groupCollapsed = Console.originalConsole.groupCollapsed;
      console.groupEnd = Console.originalConsole.groupEnd;
      Console.originalConsole = null;
    }

    Console.initialized = false
  }
}