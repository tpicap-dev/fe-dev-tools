import { Terminal as XTerm } from '@xterm/xterm'
import beautify from 'json-beautify'

import { isPrimitive } from '../../utils/utils'

import '../../../node_modules/@xterm/xterm/css/xterm.css'

export default class Terminal {
  static status = {
    initilized: false
  }
  static area: HTMLElement = null
  static xterm: XTerm = new XTerm({
    fontFamily: 'arial, sans-serif',
    fontSize: 13,
    cols: 30,
  })
  static windowConsole = window.console
  static filter: string = ''

  static init() {
    Terminal.status.initilized = true
    Terminal.setElement()
    Terminal.xterm.open(Terminal.area)
    Terminal.overrideConsole()
  }

  static setElement() {
    const area = document.createElement('div')
    area.setAttribute('style', 'width: 100%; height: 300px;')
    area.appendChild(Terminal.getTitle())
    area.appendChild(Terminal.getHeader())

    Terminal.area = area
  }

  static getTitle() {
    const title = document.createElement('h3')
    title.innerHTML = 'Console'
    title.setAttribute('class', 'demo-tools-steps-title')
    return title
  }

  static getHeader() {
    const header = document.createElement('div')
    const filter = document.createElement('input')
    const clear = document.createElement('button')
    const path = document.createElement('input')
    const props = document.createElement('input')

    header.setAttribute('style', 'display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5px; padding: 5px;')
    filter.setAttribute('placeholder', 'Filter')
    clear.innerText = 'Clear'
    path.setAttribute('placeholder', 'Path')
    props.setAttribute('placeholder', 'Props')

    clear.addEventListener('click', Terminal.handleClearClick)
    clear.classList.add('demo-tools-terminal-clear')

    filter.classList.add('demo-tools-terminal-filter')
    filter.addEventListener('change', Terminal.handleFilterChange)

    header.appendChild(filter)
    header.appendChild(path)
    header.appendChild(props)
    header.appendChild(clear)

    return header
  }

  static overrideConsole() {
    window.console.log = Terminal.log
    window.console.info = Terminal.log
  }

  static log(...args) {
    const logs: string[] = []
    ;(args || []).forEach((arg) => {
      const log = isPrimitive(arg) ? String(arg) : beautify(arg, null, 2, 20)

      if (log.includes(Terminal.filter)) {
        logs.push(log)
      }
    })

    if (logs.length === 0) {
      return
    }

    Terminal.xterm.writeln(logs.join(' '))
  }

  static destroy() {
    window.console.log = Terminal.windowConsole.log
    window.console.info = Terminal.windowConsole.info
    Terminal.status.initilized = false
    Terminal.removeListeners()
    Terminal.area = null
    Terminal.xterm.element?.remove()
  }

  static handleClearClick() {
    Terminal.xterm.clear()
  }

  static handleFilterChange(event) {
    Terminal.filter = event.target.value
  }

  static removeListeners() {
    Terminal.area?.querySelector('.demo-tools-terminal-clear')?.removeEventListener(
      'click',
      Terminal.handleClearClick
    )

    Terminal.area?.querySelector('.demo-tools-terminal-filter')?.removeEventListener(
      'keypress',
      Terminal.handleFilterChange
    )
  }
}