import Sortable from 'sortablejs'

import { IStep } from '../demo-tools'

import './steps.less'
import { isNil } from 'ramda'
import PlanStepForm from './plan-step-form'

export default class Steps {
  static steps: (IStep)[] = []
  static state = {
    initialized: false,
  }
  static eventTypes = {
    STEP_DOUBLECLICK: 'DemoTools:Steps:StepDoubleclick',
    STEP_MOVE: 'DemoTools:Steps:StepMove',
    STEP_CLICK: 'DemoTools:Steps:StepClick',
  }

  static init() {
    Steps.state.initialized = true
    window.addEventListener('DemoTools:StepsChanged', Steps.handleDemoToolsStepsChanged)
    window.addEventListener('DemoTools:ActiveStepChanged', Steps.handleDemoToolsActiveStepChanged)
    Steps.renderSteps()
  }

  static handleDemoToolsStepsChanged({ detail: { steps } }: CustomEvent<{ steps: (IStep)[] }>) {
    Steps.steps = steps
    Steps.renderSteps()
  }

  static handleDemoToolsActiveStepChanged({ detail: { activeStep } }: CustomEvent<{ activeStep: Number | null }>) {
    Steps.setActiveStep(activeStep)
  }

  static handleStepDoubleClick(index) {
    window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_DOUBLECLICK, { detail: { index } }))
  }

  static handleStepClick(index) {
    window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_CLICK, { detail: { index } }))
  }

  static add(step: IStep) {
    Steps.steps.push(step)
  }

  static renderSteps() {
    Steps.unmount()

    if (!Steps.state.initialized || !Steps.steps) {
      throw new Error('DemoTools: Steps are not initialized')
    }

    const area = document.createElement('div')
    area.setAttribute('class', 'demo-tools demo-tools-steps')

    const title = document.createElement('h2')
    title.innerHTML = 'Demo steps'
    title.setAttribute('class', 'demo-tools-steps-title')

    const list = document.createElement('div')
    list.setAttribute('style', 'overflow-y: auto; padding-left: 1px; display: flex; flex-direction: column; gap: 3px;')
    list.setAttribute('class', 'demo-tools-steps-list')
    Steps.steps.forEach(step => {
      const div = document.createElement('div')
      if (!step.list) {
        div.setAttribute('style', 'display: none;')
      }
      div.setAttribute('class', 'demo-tools-step')
      if (!step.isFilled) {
        div.classList.add('unfilled')
      }
      div.innerHTML = step.title
      list.appendChild(div)
    })

    area.appendChild(title)
    area.appendChild(PlanStepForm.getForm())
    area.appendChild(list)
    document.body.style.display = 'flex'
    document.body.appendChild(area)

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

  static unmount() {
    document.body.querySelectorAll('.demo-tools-steps').forEach(el => el.remove())
    document.body.style.display = 'block'
  }

  static destroy() {
    Steps.unmount()
    window.removeEventListener('DemoTools:StepsChanged', Steps.handleDemoToolsStepsChanged)
  }

  static setupInteractivity() {
    Sortable.create(document.querySelector('.demo-tools-steps-list'), {
      onEnd: (evt) => {
        window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_MOVE, { detail: { from: evt.oldIndex, to: evt.newIndex } }))
      }
    })

    document.querySelectorAll('.demo-tools-steps-list .demo-tools-step').forEach((el, index) => {
      el.addEventListener('dblclick', () => {
        Steps.handleStepDoubleClick(index)
      })
    })

    document.querySelectorAll('.demo-tools-steps-list .demo-tools-step').forEach((el, index) => {
      el.addEventListener('click', () => {
        Steps.handleStepClick(index)
      })
    })
  }
}