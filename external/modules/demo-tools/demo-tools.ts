import { findIndex, insert, is, isEmpty, isNil, remove, values } from 'ramda'
import { Config, driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import Steps from './steps/steps'
import StepForm from './demo-tools-step-form'
import { getElementByXPath } from '../../utils/utils'
import Step from 'external/modules/demo-tools/step'
import PlanStepForm from 'external/modules/demo-tools/steps/plan-step-form'
import Dom from 'external/modules/demo-tools/dom'

export interface IStepBase {
  title: string;
  interval?: number;
  type: 'highlight' | 'custom' | 'click' | 'rightclick' | 'hover';
  list?: boolean;
  isFilled: boolean;
}

export interface ICustomStep extends IStepBase {
  func: () => void;
}

export interface IClickStep extends IStepBase {
  selector?: string;
  element?: HTMLElement;
  xPath?: string;
}

export interface IHighlightingStep extends IStepBase {
  selector?: string;
  element?: HTMLElement;
  xPath?: string;
  area?: IArea;
  shiftX?: number;
  shiftY?: number;
  shiftWidth?: number;
  shiftHeight?: number;
}

export type IElementBoundStep = IHighlightingStep | IClickStep
export type IStep = IHighlightingStep | ICustomStep | IClickStep

interface IArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface IBlinkOptions {
  size?: number;
  color?: string;
  border?: string;
  duration?: number;
}

interface IOptions {
  renderSteps?: boolean;
  renderStepsStyle?: any;
}

interface IRunOptions extends IOptions {
  stepIndex?: number;
}

interface IState {
  running: boolean;
  activeStep: number | null;
  initialized: boolean;
  lastUpdatedStep: number | null;
}

export default abstract class DemoTools {
  static defaultInterval = 2000;
  static steps: IStep[] = [];
  static Driver = driver;
  static driver: any;
  static stepList = Steps;
  static stepForm = StepForm;
  static dom = Dom;
  static options = {} as IOptions;
  static state: IState = {
    running: false,
    activeStep: null,
    initialized: false,
    lastUpdatedStep: null,
  }
  static defaultDriverOptions: Config = {
    showButtons: ['close'],
    overlayOpacity: 0.3,
  };

  static addStep(step: IStep = {} as any) {
    DemoTools.insertStep(step, DemoTools.steps.length)
  }

  static addHighlightStep(step: Omit<IHighlightingStep, 'type'> = {} as any) {
    DemoTools.addStep({
      ...step,
      title: step.title || `Step ${DemoTools.steps.length}`,
      type: 'highlight',
    })
  }

  static async pickStep(): Promise<void> {
    const hoveredEls = document.querySelectorAll(':hover')

    if (isNil(hoveredEls) || isEmpty(hoveredEls)) {
      return
    }


    let xPath = ''

    hoveredEls.forEach((el, i) => {
      let index = 0
      if (el.parentElement) {
        index = Array.from(el.parentElement.children).indexOf(el)
      }
      xPath += `/*[${index + 1}]`
    })

    if (isEmpty(xPath)) {
      return
    }

    let step

    if (DemoTools.state.activeStep !== null) {
      step = await DemoTools.stepForm.getPrompt({
        title: DemoTools.steps[DemoTools.state.activeStep].title,
        xPath
      } as IStep)
    } else {
      step = await DemoTools.stepForm.getPrompt(xPath)
    }

    if (!step) {
      return
    }

    if (DemoTools.state.activeStep !== null) {
      await DemoTools.updateStep(DemoTools.state.activeStep, step)
      if (DemoTools.steps[DemoTools.state.activeStep + 1]?.isFilled === false) {
        DemoTools.state.activeStep = DemoTools.state.activeStep + 1
        DemoTools.dispatchActiveStepChangedEvent()
      }
      return
    } else {
      DemoTools.addStep(step)
    }
  }

  static setSteps(steps: IStep[] | { [key: number]: IStep }) {
    if (isNil(steps) || isEmpty(steps)) {
      return
    }
    
    DemoTools.stop()
    values(steps).forEach((step: IStep) => DemoTools.insertStep(step))
  }

  static insertStep(step: IStep = {} as any, index?: number) {
    const adjustedStep = new Step({
      ...step,
      title: step.title || `Custom step ${index}`,
      type: step.type || 'click',
      list: typeof step.list === 'boolean' ? step.list : true,
    })
    const index1 = !isNil(index) ? Number(index) : DemoTools.state.activeStep !== null ? DemoTools.state.activeStep + 1 : DemoTools.steps.length
    DemoTools.steps = insert(index1, adjustedStep, DemoTools.steps)
    DemoTools.state.lastUpdatedStep = index1
    DemoTools.dispatchStepsChangedEvent()
  }

  static async updateStep(title?: string | number, step?: IStep) {
    if (!DemoTools.state.initialized) {
      throw new Error('DevTools: DemoTools is not initialized')
    }

    if (DemoTools.state.running) {
      DemoTools.pause()
    }
    let index
    if (!isNil(title)) {
      if (isNaN(Number(title))) {
        index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), DemoTools.steps)
      } else {
        index = title
      }
      if (index === -1) {
        return
      }
    } else {
      index = Number(isNil(DemoTools.state.activeStep) ? DemoTools.state.lastUpdatedStep : DemoTools.state.activeStep || 0)
    }

    const updatedStep = step || await DemoTools.stepForm.getPrompt(DemoTools.steps[index])

    DemoTools.state.lastUpdatedStep = index
    DemoTools.steps[index] = new Step({ ...DemoTools.steps[index], ...updatedStep })
    DemoTools.dispatchStepsChangedEvent()
  }

  static removeStep(title: string | number) {
    let index
    if (isNaN(Number(title))) {
      index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), DemoTools.steps)
    } else {
      index = title
    }
    if (index === -1) {
      return
    }
    DemoTools.steps = remove(index, 1, DemoTools.steps)
    if (DemoTools.state.activeStep === index) {
      DemoTools.state.activeStep = null
      DemoTools.dispatchActiveStepChangedEvent()
    }
    DemoTools.dispatchStepsChangedEvent()
  }

  static removeAllSteps() {
    DemoTools.steps = []
    DemoTools.dispatchStepsChangedEvent()
  }

  static doStep(title: string | number) {
    if (!DemoTools.state.initialized) {
      throw new Error('DevTools: DemoTools is not initialized')
    }
    DemoTools.state.lastUpdatedStep = null
    let index
    if (isNaN(Number(title))) {
      index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), DemoTools.steps)
    } else {
      index = title
    }
    if (index === -1 || index >= DemoTools.steps.length) {
      return
    }

    DemoTools.state.activeStep = index
    DemoTools.dispatchActiveStepChangedEvent()

    if(DemoTools.steps[index].type === 'highlight') {
      DemoTools.highlight(index)
    } else if (DemoTools.steps[index].type === 'click') {
      Dom.click((DemoTools.steps[index] as IClickStep))
    } else if (DemoTools.steps[index].type === 'rightclick') {
      Dom.rightClick((DemoTools.steps[index] as IClickStep))
    } else if (DemoTools.steps[index].type === 'hover') {
      Dom.hover((DemoTools.steps[index] as IClickStep))
    } else {
      (DemoTools.steps[index] as ICustomStep).func()
    }
  }

  static async run(options: IRunOptions = {}) {
    DemoTools.options = { ...DemoTools.options, ...options }
    DemoTools.state.running = true
    for (let i = options?.stepIndex || DemoTools.state.activeStep || 0; i < DemoTools.steps.length; i++) {
      if(!DemoTools.state.running) {
        break
      }
      DemoTools.doStep(i)
      const step = DemoTools.steps[i]
      await new Promise(resolve => setTimeout(resolve, step.interval || DemoTools.defaultInterval))

      if (step.type === 'highlight') {
        DemoTools.unhighlight()
      }
    }

    if (DemoTools.state.activeStep === DemoTools.steps.length - 1) {
      DemoTools.state.running = false
      DemoTools.state.activeStep = null
      DemoTools.dispatchActiveStepChangedEvent()
    }
  }

  static jump(index: number) {
    DemoTools.pause()
    DemoTools.state.activeStep = Number(index)
    DemoTools.doStep(DemoTools.state.activeStep)
  }

  static swap(index1: number, index2: number) {
    const tmp = DemoTools.steps[Number(index1)]
    DemoTools.steps[Number(index1)] = DemoTools.steps[Number(index2)]
    DemoTools.steps[Number(index2)] = tmp
    DemoTools.dispatchStepsChangedEvent()

    if (index1 === DemoTools.state.activeStep || index2 === DemoTools.state.activeStep) {
      DemoTools.dispatchActiveStepChangedEvent()
    }
  }

  static move(index1: number, index2?: number) {
    const index = !isNil(index2) ? index1 : DemoTools.state.activeStep
    const tmp = DemoTools.steps[index]
    DemoTools.steps.splice(index, 1)
    DemoTools.steps.splice(!isNil(index2) ? index2 : index1, 0, tmp)
    DemoTools.dispatchStepsChangedEvent()
  }

  static copy(index1?: number, index2?: number) {
    const index = !isNil(index1) ? index1 : DemoTools.state.activeStep
    DemoTools.insertStep(DemoTools.steps[index], !isNil(index2) ? index2 : index1 + 1)
  }

  static stop() {
    DemoTools.state.running = false
    DemoTools.state.activeStep = null
    DemoTools.state.lastUpdatedStep = null
    DemoTools.unhighlight()
    DemoTools.dispatchActiveStepChangedEvent()
  }

  static pause() {
    DemoTools.state.running = false
  }

  static resume() {
    DemoTools.run()
  }

  static reset() {
    DemoTools.pause()
    DemoTools.state.activeStep = null
    DemoTools.state.lastUpdatedStep = null
    DemoTools.unhighlight()
    Steps.unmount()
    DemoTools.dispatchActiveStepChangedEvent()
  }

  static destroy() {
    DemoTools.stop()
    DemoTools.removeAllSteps()
    DemoTools.state.initialized = false
    Steps.destroy()
    window.removeEventListener('keydown', DemoTools.handleKeydown)
    DemoTools.options = {}
  }

  static highlight(stepIndex: number) {
    if (isNil(DemoTools.steps[stepIndex])) {
      return
    }
    const { title, selector, xPath, area, shiftX, shiftY, shiftHeight, shiftWidth } = DemoTools.steps[stepIndex] as IHighlightingStep

    let areaNew: IArea | undefined = undefined

    if (isNil(area)) {
      let tmpElement
      if (is(String, xPath)) {
        tmpElement = getElementByXPath(xPath)
      } else if (is(String, selector)) {
        tmpElement = document.querySelector(selector)
      } else {
        tmpElement = selector
      }

      if (!tmpElement) {
        return
      }

      const rect = tmpElement.getBoundingClientRect()
      areaNew = {
        left: rect.left + (shiftX || 0) + window.scrollX,
        top: rect.top + (shiftY || 0) + window.scrollY,
        width: rect.width + (shiftWidth || 0),
        height: rect.height + (shiftHeight || 0),
      }
    }

    const element = DemoTools.appendHighlightArea(area || areaNew)

    if (!element) {
      return
    }

    DemoTools.driver = DemoTools.Driver({
      ...DemoTools.defaultDriverOptions,
      steps: [{
        element,
        popover: {
          description: title,
        }
      }]
    })

    DemoTools.driver.drive()
  }

  static unhighlight() {
    if (DemoTools.driver) {
      DemoTools.driver.destroy()
    }
    const highlightArea = document.querySelector('#demo-tools-highlight-area')
    if (highlightArea) {
      highlightArea.remove()
    }
  }

  static appendHighlightArea(area: IArea): HTMLDivElement {
    const { left, top, width, height } = area
    const style = `position: absolute; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`
    const div = document.createElement('div')
    div.setAttribute('style', style)
    div.setAttribute('id', 'demo-tools-highlight-area')
    document.body.appendChild(div)
    return div
  }

  static check(selector: string | IArea): void {
    document.querySelectorAll('#demo-tools-highlight-area')?.forEach(el => { el.remove() })

    let element

    if (is(String, selector)) {
      element = document.querySelector(selector)
    } else {
      element = this.appendHighlightArea(selector as IArea)
    }

    if (!element) {
      return
    }

    DemoTools.driver = DemoTools.Driver({
      ...DemoTools.defaultDriverOptions,
      onDestroyed: () => document.querySelectorAll('#demo-tools-highlight-area')?.forEach(el => { el.remove() })
    })
    DemoTools.driver.highlight({
      element,
      popover: {
        description: is(String, selector) ?
          `Element: ${element.nodeName.toLowerCase()}${selector}<br />parent element: ${element.parentElement?.nodeName.toLowerCase()}.${Array.from(element.parentElement?.classList).join('.')}` :
          'Appended area',
      }
    })
  }

  static printSteps() {
    console.table(DemoTools.steps.map((step) => ({ title: step.title, type: step.type })))
  }

  static init(options: IOptions = {}) {
    DemoTools.stop()

    if (DemoTools.state.initialized) {
      return
    }
    DemoTools.options.renderSteps = Boolean(options.renderSteps)
    DemoTools.options.renderStepsStyle = options.renderStepsStyle
    DemoTools.state.initialized = true
    window.addEventListener('keydown', DemoTools.handleKeydown)
    DemoTools.stepForm.init()
    if(options.renderSteps) {
      DemoTools.stepList.init()
      window.addEventListener(DemoTools.stepList.eventTypes.STEP_MOVE, DemoTools.handleStepMoved)
      window.addEventListener(DemoTools.stepList.eventTypes.STEP_DOUBLECLICK, DemoTools.handleStepDoubleclick)
      window.addEventListener(DemoTools.stepList.eventTypes.STEP_CLICK, DemoTools.handleStepClick)
      window.addEventListener(PlanStepForm.eventTypes.PLAN_STEP, DemoTools.handlePlanStep)
    }
  }

  static handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      DemoTools.pause()
    } else if (e.ctrlKey && e.altKey) {
      if (e.key === 'p') {
        if(DemoTools.state.running) {
          DemoTools.pause()
          return
        }
        DemoTools.pickStep()
      } else if (e.key === 'r') {
        DemoTools.run()
      } else if (e.key === 's') {
        DemoTools.stop()
      } else if (e.key === 'ArrowRight') {
        DemoTools.jump(DemoTools.state.activeStep + 1)
      } else if (e.key === 'ArrowLeft') {
        DemoTools.jump(DemoTools.state.activeStep - 1)
      } else if (e.key === 'ArrowUp') {
        DemoTools.swap(DemoTools.state.activeStep, DemoTools.state.activeStep - 1)
      } else if (e.key === 'ArrowDown') {
        DemoTools.swap(DemoTools.state.activeStep, DemoTools.state.activeStep + 1)
      } else if (e.key === 'u') {
        DemoTools.updateStep()
      } else if (e.key === 'd') {
        DemoTools.removeStep(DemoTools.state.activeStep)
      }
    }
  }

  static handleStepMoved(e: CustomEvent) {
    if (DemoTools.options.renderSteps) {
      DemoTools.move(e.detail.from, e.detail.to)
    }
  }

  static handleStepDoubleclick(e: CustomEvent) {
    if (DemoTools.options.renderSteps) {
      DemoTools.jump(e.detail.index)
    }
  }

  static handleStepClick(e: CustomEvent) {
    if (DemoTools.options.renderSteps) {
      DemoTools.state.activeStep = e.detail.index
      DemoTools.dispatchActiveStepChangedEvent()
    }
  }

  static handlePlanStep(e: CustomEvent) {
    if (DemoTools.options.renderSteps) {
      DemoTools.addStep(e.detail)
    }
  }

  static dispatchStepsChangedEvent() {
    window.dispatchEvent(new CustomEvent('DemoTools:StepsChanged', { detail: { steps: DemoTools.steps } }))
  }

  static dispatchActiveStepChangedEvent() {
    window.dispatchEvent(new CustomEvent('DemoTools:ActiveStepChanged', { detail: { activeStep: DemoTools.state.activeStep } }))
  }
}
