import Sortable from 'sortablejs'
import { isNil } from 'ramda'


import PlanStepForm from 'external/modules/demo-tools/steps/plan-step-form'

import './steps.less'
import Step from 'external/modules/demo-tools/step'

export default class Steps {
  static area: HTMLElement = null
  static steps: (Step)[] = []
  static state = {
    initialized: false,
  }
  static eventTypes = {
    STEP_DOUBLECLICK: 'DemoTools:Steps:StepDoubleclick',
    STEP_MOVE: 'DemoTools:Steps:StepMove',
    STEP_CLICK: 'DemoTools:Steps:StepClick',
    STEP_CTRL_CLICK: 'DemoTools:Steps:StepCtrlClick',
  }

  static init() {
    Steps.state.initialized = true
    window.addEventListener('Demo:StepsChanged', Steps.handleDemoToolsStepsChanged)
    window.addEventListener('Demo:ActiveStepChanged', Steps.handleDemoToolsActiveStepChanged)
    PlanStepForm.init()
    Steps.setElement()
  }

  static handleDemoToolsStepsChanged({ detail: { steps } }: CustomEvent<{ steps: (Step)[] }>) {
    Steps.steps = steps
    Steps.renderStepList()
  }

  static handleDemoToolsActiveStepChanged({ detail: { activeStep } }: CustomEvent<{ activeStep: Number | null }>) {
    Steps.setActiveStep(activeStep)
  }

  static handleStepDoubleClick(index) {
    window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_DOUBLECLICK, { detail: { index } }))
  }

  static handleStepClick(event: MouseEvent, index: number) {
    if (event.ctrlKey) {
      window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_CTRL_CLICK, {detail: {index}}))
    } else {
      window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_CLICK, {detail: {index}}))
    }
  }

  static add(step: Step) {
    Steps.steps.push(step)
  }

  static setElement() {
    if (!Steps.state.initialized || !Steps.steps) {
      throw new Error('DemoTools: Steps are not initialized')
    }

    const area = document.createElement('div')
    area.setAttribute('class', 'demo-tools-steps')

    const title = document.createElement('h3')
    title.innerHTML = 'Demo steps'
    title.setAttribute('class', 'demo-tools-steps-title')

    const list = Steps.getStepListElement()

    area.appendChild(title)
    area.appendChild(PlanStepForm.area)
    area.appendChild(list)

    Steps.area = area
    Steps.setupInteractivity()
  }

  static renderStepList() {
    if (!Steps.state.initialized) {
      throw new Error('DevTools: Steps are not initialized')
    }
    Steps.unmountStepList()

    const list = Steps.getStepListElement()

    Steps.area.appendChild(list)
    Steps.setupInteractivity()
  }

  static setActiveStep(index) {
    if (!isNil(index) && !Steps.steps[index].list) {
      return
    }
    const stepEls = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step')

    for (let i = 0; i < stepEls.length; i++) {
      if (!Steps.steps[i].list) {
        continue
      }
      stepEls[i].classList.remove('completed')
      stepEls[i].classList.remove('active')
    }

    if (isNil(index)) {
      return
    }

    for (let i = 0; i < index; i++) {
      if (!Steps.steps[i].list) {
        continue
      }
      stepEls[i].classList.add('completed')
      stepEls[i].classList.remove('active')
    }
    stepEls[index].classList.add('active')
    stepEls[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  static getStepListElement() {

    const list = document.createElement('div')
    list.setAttribute('style', 'overflow-y: auto; padding-left: 1px; display: flex; flex-direction: column; gap: 2px;')
    list.setAttribute('class', 'demo-tools-steps-list')
    Steps.steps.forEach((step, index) => {
      const div = document.createElement('div')
      if (!step.list) {
        div.setAttribute('style', 'display: none;')
      }
      div.setAttribute('class', 'demo-tools-step')
      if (!step.isFilled) {
        div.classList.add('unfilled')
      }

      if (!step.hasCorrectXPath) {
        if (step.xPathCheck === false) {
          div.classList.add('unavailable')
          div.setAttribute('title', `HTML Element looks unavailable:\n${step.xPathError}`)
          div.innerHTML = `
            <div>${step.title}</div>
            <div class="demo-tools-steps-step-actions">
              <button onclick="window.demoTools.demo?.checkStep(${index})">Check</button>
              <button onclick="window.demoTools.demo?.ignoreXPathError(${index})">Ignore</button>
            </div>
          `
        } else if (step.xPathCheck === 'ignored') {
          div.classList.add('ignored')
          div.setAttribute('title', 'XPath error is ignored')
          div.innerHTML = step.title
        } else {
          div.innerHTML = step.title
        }
      } else {
        div.innerHTML = step.title
      }
      list.appendChild(div)
    })

    return list
  }

  static allocate(width?: number) {
    const area = document.createElement('div')
    area.setAttribute('class', 'demo-tools-steps')
    if (width) {
      area.setAttribute('style', `width: ${width}px;`)
    }
    document.body.style.display = 'flex'
    document.body.appendChild(area)
  }

  static clear() {
    document.body.querySelectorAll('.demo-tools-steps').forEach((el) => {
      el.setAttribute('style', `width: ${el.clientWidth}px; min-width: ${el.clientWidth}px;`)
      el.querySelector('.demo-tools-steps-list')?.remove()
    })
  }

  static unmountStepList() {
    document.body.querySelectorAll('.demo-tools-steps .demo-tools-steps-list').forEach(el => el.remove())
  }

  static unmount() {
    document.body.querySelectorAll('.demo-tools-steps').forEach(el => el.remove())
  }

  static destroy() {
    Steps.unmount()
    window.removeEventListener('Demo:StepsChanged', Steps.handleDemoToolsStepsChanged)
    Steps.area = null
    Steps.steps = []
    Steps.state.initialized = false
    PlanStepForm.destroy()
  }

  static setupInteractivity() {
    Sortable.create(Steps.area.querySelector('.demo-tools-steps-list'), {
      onEnd: (evt) => {
        window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_MOVE, { detail: { from: evt.oldIndex, to: evt.newIndex } }))
      }
    })

    Steps.area.querySelectorAll('.demo-tools-steps-list .demo-tools-step').forEach((el, index) => {
      el.addEventListener('dblclick', () => {
        Steps.handleStepDoubleClick(index)
      })
    })

    Steps.area.querySelectorAll('.demo-tools-steps-list .demo-tools-step').forEach((el, index) => {
      el.addEventListener('click', (e: MouseEvent) => {
        Steps.handleStepClick(e, index)
      })
    })
  }
}