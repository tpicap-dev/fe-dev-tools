import { findIndex, insert, is, isEmpty, isNil, pick, remove, values } from 'ramda'
import { Config, driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import Steps from './steps/steps'
import StepForm from './demo-tools-step-form'
import { getElementByXPath } from '../../utils/utils'
import Step from 'external/modules/demo-tools/step'
import CheckStepPrompt from 'external/modules/demo-tools/demo-tools-check-step-prompt'
import PlanStepForm from 'external/modules/demo-tools/steps/plan-step-form'
import Dom from 'external/modules/demo-tools/dom'
import Toolbar from 'external/modules/demo-tools/toolbar'
import Terminal from 'external/modules/demo-tools/terminal'

declare function setVar(arg1: string, arg2: any): void;

export interface IStepBase {
  title: string;
  interval?: number;
  type: 'highlight' | 'custom' | 'click' | 'rightclick' | 'hover';
  list?: boolean;
  isFilled: boolean;
  customData?: any;
  element?: Partial<HTMLElement>;
}

export interface ICustomStep extends IStepBase {
  func: () => void;
}

export interface IClickStep extends IStepBase {
  selector?: string;
  xPath?: string;
}

export interface IHighlightingStep extends IStepBase {
  selector?: string;
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

interface IOptions {
  renderToolbar?: boolean;
  renderStepsStyle?: any;
  persist?: boolean;
  interval?: number;
}

interface IRunOptions extends IOptions {
  from?: number;
  till?: number;
}

interface IState {
  running: boolean;
  activeStep: number | null;
  initialized: boolean;
  lastUpdatedStep: number | null;
}

let steps: IStep[] = [];

export default abstract class DemoTools {
  static defaultInterval = 2000;
  static Driver = driver;
  static driver: any;
  static stepList = Steps;
  static stepForm = StepForm;
  static dom = Dom;
  static terminal = Terminal;
  static options = {} as IOptions;
  static initialState: IState = {
    running: false,
    activeStep: null,
    initialized: false,
    lastUpdatedStep: null,
  }
  static state: IState = { ...DemoTools.initialState };
  static defaultDriverOptions: Config = {
    showButtons: ['close'],
    overlayOpacity: 0.3,
  };

  static get steps() { return { ...steps } }

  static addStep(step: IStep = {} as any) {
    DemoTools.insertStep(step, steps.length)
  }

  static addHighlightStep(step: Omit<IHighlightingStep, 'type'> = {} as any) {
    DemoTools.addStep({
      ...step,
      title: step.title || `Step ${steps.length}`,
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
      step = await StepForm.getPrompt({
        title: steps[DemoTools.state.activeStep].title,
        xPath
      } as IStep)
    } else {
      step = await StepForm.getPrompt(xPath)
    }

    if (!step) {
      return
    }

    if (DemoTools.state.activeStep !== null) {
      await DemoTools.updateStep(DemoTools.state.activeStep, step)

      if (steps[DemoTools.state.activeStep + 1]?.isFilled === false) {
        DemoTools.select(DemoTools.state.activeStep + 1)
      } else {
        DemoTools.select(null)
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
    DemoTools.select(0)
  }

  static insertStep(step: IStep = {} as any, index?: number) {
    const adjustedStep = new Step({
      ...step,
      title: step.title || `Custom step ${index}`,
      type: step.type || 'click',
      list: typeof step.list === 'boolean' ? step.list : true,
    })
    const index1 = !isNil(index) ? Number(index) : DemoTools.state.activeStep !== null ? DemoTools.state.activeStep + 1 : steps.length
    steps = insert(index1, adjustedStep, steps)
    DemoTools.state.lastUpdatedStep = index1
    DemoTools.onStepsChanged()
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
        index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), steps)
      } else {
        index = title
      }
      if (index === -1) {
        return
      }
    } else {
      index = Number(isNil(DemoTools.state.activeStep) ? DemoTools.state.lastUpdatedStep : DemoTools.state.activeStep || 0)
    }

    const updatedStep = step || await StepForm.getPrompt(steps[index])

    DemoTools.state.lastUpdatedStep = index
    steps[index] = new Step({ ...steps[index], ...updatedStep })
    DemoTools.onStepsChanged()
  }

  static removeStep(title: string | number) {
    let index
    if (isNaN(Number(title))) {
      index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), steps)
    } else {
      index = title
    }
    if (index === -1) {
      return
    }
    steps = remove(index, 1, steps)
    if (DemoTools.state.activeStep === index) {
      DemoTools.select(null)
    }
    DemoTools.onStepsChanged()
  }

  static removeAllSteps() {
    steps = []
    DemoTools.onStepsChanged()
  }

  static clear() {
    DemoTools.removeAllSteps()
  }

  static doStep(title: string | number) {
    if (!DemoTools.state.initialized) {
      throw new Error('DevTools: DemoTools is not initialized')
    }
    DemoTools.state.lastUpdatedStep = null
    let index
    if (isNaN(Number(title))) {
      index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), steps)
    } else {
      index = title
    }
    if (index === -1 || index >= steps.length) {
      return
    }

    DemoTools.select(index)

    if(steps[index].type === 'highlight') {
      DemoTools.highlight(index)
    } else if (steps[index].type === 'click') {
      Dom.click((steps[index] as IClickStep))
    } else if (steps[index].type === 'rightclick') {
      Dom.rightClick((steps[index] as IClickStep))
    } else if (steps[index].type === 'hover') {
      Dom.hover((steps[index] as IClickStep))
    } else {
      (steps[index] as ICustomStep)?.func()
    }
  }

  static async run(options: IRunOptions = {}) {
    DemoTools.dispatchRunEvent()
    DemoTools.options = { ...DemoTools.options, ...options }
    DemoTools.state.running = true
    for (let i = options?.from || DemoTools.state.activeStep || 0; i <= (options?.till || steps.length - 1); i++) {
      if(!DemoTools.state.running) {
        break
      }
      DemoTools.doStep(i)
      const step = steps[i]
      await new Promise(resolve => setTimeout(resolve, step?.interval || DemoTools.options.interval || DemoTools.defaultInterval))

      if (step.type === 'highlight') {
        DemoTools.unhighlight()
      }
    }

    if (DemoTools.state.activeStep === options?.till || steps.length - 1) {
      DemoTools.stop()
    }
  }

  static jump(index: number) {
    if (index < 0 || index >= steps.length) {
      return
    }
    DemoTools.doStep(index)
  }

  static select(index: number | null) {
    DemoTools.state.activeStep = index
    DemoTools.dispatchActiveStepChangedEvent()
  }

  static swap(index1: number, index2: number) {
    if (isNil(index1) || isNil(index2) || index1 === index2 || index1 < 0 || index2 < 0 || index1 >= steps.length || index2 >= steps.length) {
      return
    }
    const tmp = steps[Number(index1)]
    steps[Number(index1)] = steps[Number(index2)]
    steps[Number(index2)] = tmp
    DemoTools.onStepsChanged()

    if (index1 === DemoTools.state.activeStep || index2 === DemoTools.state.activeStep) {
      if (index1 === DemoTools.state.activeStep) {
        DemoTools.select(index2)
      } else {
        DemoTools.select(index1)
      }
    }
  }

  static move(index1: number, index2?: number) {
    const index = !isNil(index2) ? index1 : DemoTools.state.activeStep
    const tmp = steps[index]
    steps.splice(index, 1)
    steps.splice(!isNil(index2) ? index2 : index1, 0, tmp)
    DemoTools.onStepsChanged()
  }

  static copy(index1?: number, index2?: number) {
    const index = !isNil(index1) ? index1 : DemoTools.state.activeStep
    DemoTools.insertStep(steps[index], !isNil(index2) ? index2 : index1 + 1)
  }

  static stop() {
    DemoTools.pause()
    DemoTools.state.lastUpdatedStep = null
    DemoTools.unhighlight()
    DemoTools.select(null)
    DemoTools.dispatchStopEvent()
  }

  static pause() {
    DemoTools.state.running = false
  }

  static resume() {
    DemoTools.run()
  }

  static destroy() {
    DemoTools.stop()
    DemoTools.removeAllSteps()
    Toolbar.destroy()
    CheckStepPrompt.destroy()
    StepForm.destroy()
    DemoTools.state = { ...DemoTools.initialState }
    window.removeEventListener('keydown', DemoTools.handleKeydown)
    if(DemoTools.options.renderToolbar) {
      window.removeEventListener(Steps.eventTypes.STEP_MOVE, DemoTools.handleStepMoved)
      window.removeEventListener(Steps.eventTypes.STEP_DOUBLECLICK, DemoTools.handleStepDoubleclick)
      window.removeEventListener(Steps.eventTypes.STEP_CLICK, DemoTools.handleStepClick)
      window.removeEventListener(PlanStepForm.eventTypes.PLAN_STEP, DemoTools.handlePlanStep)
    }
    DemoTools.options = {}
  }

  static highlight(stepIndex: number) {
    if (isNil(steps[stepIndex])) {
      return
    }
    const { title, selector, xPath, area, shiftX, shiftY, shiftHeight, shiftWidth } = steps[stepIndex] as IHighlightingStep

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
    const highlightArea = document.querySelectorAll('#demo-tools-highlight-area')
    if (highlightArea) {
      highlightArea.forEach(el => el.remove())
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
      element = DemoTools.appendHighlightArea(selector as IArea)
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
    console.table(steps.map((step) => ({ title: step.title, type: step.type })))
  }

  static checkStep(index: number) {
    const step = steps[index]
    CheckStepPrompt.getPrompt(step)
      .then(result => {
        if (result) {
          DemoTools.updateStep(index, result)
        }
      })
  }

  static init(options: IOptions = {}) {
    DemoTools.stop()

    if (DemoTools.state.initialized) {
      return
    }
    DemoTools.options.renderToolbar = options.renderToolbar === false ? false : true
    DemoTools.options.renderStepsStyle = options.renderStepsStyle
    DemoTools.options.persist = options.persist === false ? false : true
    DemoTools.options.interval = options.interval
    DemoTools.state.initialized = true
    window.addEventListener('keydown', DemoTools.handleKeydown)
    StepForm.init()
    CheckStepPrompt.init()
    if(options.renderToolbar) {
      Toolbar.init()
      window.addEventListener(Steps.eventTypes.STEP_MOVE, DemoTools.handleStepMoved)
      window.addEventListener(Steps.eventTypes.STEP_DOUBLECLICK, DemoTools.handleStepDoubleclick)
      window.addEventListener(Steps.eventTypes.STEP_CLICK, DemoTools.handleStepClick)
      window.addEventListener(PlanStepForm.eventTypes.PLAN_STEP, DemoTools.handlePlanStep)
    }

    if(DemoTools.options.persist) {
      DemoTools.setSteps((window as any).demoToolsSteps)
    }
  }

  static restore() {
    if (!DemoTools.state.initialized) {
      throw new Error('DevTools: DemoTools is not initialized')
    }

    if (DemoTools.options.persist) {
      DemoTools.setSteps((window as any).demoToolsSteps)
    }
  }

  static isElementBoundStep(step: IElementBoundStep) {
    return !isNil(step.selector) || !isNil(step.xPath) || !isNil((step as IHighlightingStep).area)
  }

  static onStepsChanged() {
    if(DemoTools.options.persist) {
      try {
        setVar('demoToolsSteps', steps)
      } catch (e) { console.error(e) }
    }
    DemoTools.dispatchStepsChangedEvent()
  }

  static handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      DemoTools.pause()
    } else if (e.ctrlKey && e.altKey) {
      switch(e.key) {
        case 'p': {
          if(DemoTools.state.running) {
            DemoTools.pause()
            return
          }
          DemoTools.pickStep()
          break;
        }
        case 'r': {
          DemoTools.run()
          break;
        }
        case 's': {
          DemoTools.stop()
          break;
        }
        case 'ArrowRight': {
          if (DemoTools.state.activeStep !== null && DemoTools.state.activeStep < steps.length - 1) {
            if (e.shiftKey) {
              DemoTools.select(DemoTools.state.activeStep + 1)
            } else {
              DemoTools.jump(DemoTools.state.activeStep + 1)
            }
          }
          break;
        }
        case 'ArrowLeft': {
          if (DemoTools.state.activeStep !== null && DemoTools.state.activeStep > 0) {
            if (e.shiftKey) {
              DemoTools.select(DemoTools.state.activeStep - 1)
            } else {
              DemoTools.jump(DemoTools.state.activeStep - 1)
            }
          }
          break;
        }
        case 'ArrowUp': {
          DemoTools.swap(DemoTools.state.activeStep, DemoTools.state.activeStep - 1)
          break;
        }
        case 'ArrowDown': {
          DemoTools.swap(DemoTools.state.activeStep, DemoTools.state.activeStep + 1)
          break;
        }
        case 'u': {
          if (DemoTools.isElementBoundStep(steps[DemoTools.state.activeStep] as IElementBoundStep)) {
            DemoTools.updateStep()
          }
          break;
        }
        case 'd': {
          DemoTools.removeStep(DemoTools.state.activeStep)
          break;
        }
        case 'c': {
          DemoTools.checkStep(DemoTools.state.activeStep)
          break;
        }
      }
    }
  }

  static handleStepMoved(e: CustomEvent) {
    DemoTools.move(e.detail.from, e.detail.to)
  }

  static handleStepDoubleclick(e: CustomEvent) {
    DemoTools.jump(e.detail.index)
  }

  static handleStepClick(e: CustomEvent) {
    DemoTools.pause()
    if (e.detail.index === DemoTools.state.activeStep) {
      DemoTools.select(null)
    } else {
      DemoTools.select(e.detail.index)
    }
  }

  static handlePlanStep(e: CustomEvent) {
    DemoTools.addStep(e.detail)
  }

  static dispatchStepsChangedEvent() {
    window.dispatchEvent(new CustomEvent('DemoTools:StepsChanged', { detail: { steps: steps } }))
  }

  static dispatchActiveStepChangedEvent() {
    window.dispatchEvent(new CustomEvent('DemoTools:ActiveStepChanged', { detail: { activeStep: DemoTools.state.activeStep } }))
  }

  static dispatchRunEvent() {
    window.dispatchEvent(new CustomEvent('DemoTools:DemoRun'))
  }

  static dispatchStopEvent() {
    window.dispatchEvent(new CustomEvent('DemoTools:DemoStop'))
  }
}
