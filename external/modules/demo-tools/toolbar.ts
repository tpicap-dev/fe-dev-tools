import MenuBar from 'external/modules/demo-tools/menu-bar/menu-bar'
import Steps from 'external/modules/demo-tools/steps/steps'
// import Terminal from 'external/modules/demo-tools/terminal'
import Info from 'external/modules/demo-tools/info'
import { options } from 'external/modules/demo-tools/demo'

export interface IToolbarOptions {
  showInfo?: boolean;
  showSteps?: boolean;
  showMenuBar?: boolean;
  showTerminal?: boolean;
}

export default class Toolbar {
  static state = {
    initialized: false,
  }
  static eventTypes = {
    ELEMENT_SET: 'DemoTools:Toolbar:ElementSet',
  }
  static sections: string[] = [
    'menuBar',
    'steps',
    // 'terminal',
    'info',
  ]
  static area: HTMLElement = null

  static init() {
    window.addEventListener('Demo:DemoRun', Toolbar.handleDemoRunEvent)
    window.addEventListener('Demo:DemoStop', Toolbar.handleDemoStopEvent)
    window.addEventListener(Info.eventTypes.ELEMENT_SET, Toolbar.handleInfoElementSet)
    if (options.mode === 'compose') {
      MenuBar.init()
    }
    // Terminal.init()
    Steps.init()
    Info.init()
    Toolbar.mount()

    Toolbar.state.initialized = true
  }

  static mount() {
    Toolbar.setElement()

    if (options.mode === 'compose') {
      Toolbar.area.querySelector('.demo-tools-toolbar-menuBar')?.appendChild(MenuBar.area)
    }
    Toolbar.area.querySelector('.demo-tools-toolbar-steps')?.replaceChildren(Steps.area)
    // Toolbar.area.querySelector('.demo-tools-toolbar-terminal')?.appendChild(Terminal.area)
    Info.area && Toolbar.area.querySelector('.demo-tools-toolbar-info')?.appendChild(Info.area)

    document.body.style.display = 'flex'
    document.body.appendChild(Toolbar.area)
  }

  static setElement() {
    if (Toolbar.area) {
      return
    }

    const area = document.createElement('div')
    const sections = Toolbar.sections.map(sectionName => {
      const el = document.createElement('div')
      el.setAttribute('class', `demo-tools-toolbar-section demo-tools-toolbar-${sectionName}`)
      return el
    })

    area.setAttribute('class', 'demo-tools demo-tools-toolbar')
    sections.forEach(section => area.appendChild(section))

    Toolbar.area = area
  }

  static unmount() {
    document.body.querySelectorAll('.demo-tools-toolbar').forEach(el => el.remove())
    Toolbar.area = null
  }

  static hideSection(sectionName: string) {
    if (Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`) instanceof HTMLElement) {
      (Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`) as HTMLElement).style.display = 'none'
    }
  }

  static showSection(sectionName: string) {
    if (Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`) instanceof HTMLElement) {
      (Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`) as HTMLElement).style.display = 'block'
    }
  }

  static destroy() {
    Toolbar.unmount()
    if (options.mode === 'compose') {
      MenuBar.destroy()
    }
    // Terminal.destroy()
    Steps.destroy()
    Info.destroy()
    document.body.style.display = 'block'
    Toolbar.state.initialized = false

    window.removeEventListener('Demo:DemoRun', Toolbar.handleDemoRunEvent)
    window.removeEventListener('Demo:DemoStop', Toolbar.handleDemoStopEvent)
    window.removeEventListener(Info.eventTypes.ELEMENT_SET, Toolbar.handleInfoElementSet)
  }

  static handleDemoRunEvent() {
    // Toolbar.hideSection('info')
  }

  static handleDemoStopEvent() {
    // Toolbar.showSection('info')
  }

  static handleInfoElementSet() {
    setTimeout(() => window.dispatchEvent(new CustomEvent(Toolbar.eventTypes.ELEMENT_SET)))
  }
}