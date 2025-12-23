import Steps from 'external/modules/demo-tools/steps/steps'
import Terminal from 'external/modules/demo-tools/terminal'
import Info from 'external/modules/demo-tools/info'

export default class Toolbar {
  static state = {
    initialized: false,
  }
  static sections: string[] = [
    'steps',
    // 'terminal',
    'info',
  ]
  static area: HTMLElement = null

  static init() {
    Steps.init()
    // Terminal.init()
    Info.init()

    Toolbar.state.initialized = true
    Toolbar.mount()

    window.addEventListener('Demo:DemoRun', Toolbar.handleDemoRunEvent)
    window.addEventListener('Demo:DemoStop', Toolbar.handleDemoStopEvent)
  }

  static mount() {
    Toolbar.setElement()

    Toolbar.area.querySelector('.demo-tools-toolbar-steps')?.appendChild(Steps.area)
    // Toolbar.area.querySelector('.demo-tools-toolbar-terminal')?.appendChild(Terminal.area)
    Toolbar.area.querySelector('.demo-tools-toolbar-info')?.appendChild(Info.area)

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
    Terminal.destroy()
    document.body.style.display = 'block'
    Steps.destroy()
    Info.destroy()
    Toolbar.state.initialized = false

    window.removeEventListener('Demo:DemoRun', Toolbar.handleDemoRunEvent)
    window.removeEventListener('Demo:DemoStop', Toolbar.handleDemoStopEvent)
  }

  static handleDemoRunEvent() {
    Toolbar.hideSection('info')
  }

  static handleDemoStopEvent() {
    Toolbar.showSection('info')
  }
}