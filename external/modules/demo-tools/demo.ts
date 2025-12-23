import { findIndex, insert, is, isEmpty, isNil, remove, values } from 'ramda'
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
import DemoTools from 'external/modules/demo-tools/demo-tools'

export interface IStepBase {
  title: string;
  interval?: number;
  type: 'highlight' | 'custom' | 'click' | 'rightclick' | 'hover' | 'setValue' | 'keyboard';
  list?: boolean;
  isFilled: boolean;
  customData?: any;
}

export interface ICustomStep extends IStepBase {
  func: () => void;
}

interface IElementBoundStepBase extends IStepBase {
  selector?: string;
  xPath?: string;
  hasCorrectXPath: boolean;
  element?: Pick<HTMLElement, 'classList' | 'id' | 'localName'>;
  xPathCheck: boolean | 'ignored';
  keyboardKey?: 'Enter' | 'Escape' | 'Tab' | 'Delete' | 'Backspace' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
}

export interface IClickStep extends IElementBoundStepBase {}

export interface IHighlightingStep extends IElementBoundStepBase {
  area?: IArea;
  shiftX?: number;
  shiftY?: number;
  shiftWidth?: number;
  shiftHeight?: number;
}

export interface IInputBoundStep extends IElementBoundStepBase {
  value: string;
}

export type IElementBoundStep = IHighlightingStep | IClickStep | IInputBoundStep
export type IStep = IElementBoundStep | ICustomStep

interface IArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface IOptions {
  renderToolbar?: boolean;
  renderStepsStyle?: any;
  interval?: number;
  steps?: IStep[];
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

let steps: Step[] = [];

export default class Demo {
  private static instance: Demo;
  static defaultInterval = 2000;
  Driver = driver;
  driver: any;
  stepList = Steps;
  stepForm = StepForm;
  dom = Dom;
  terminal = Terminal;
  options = {} as IOptions;
  initialState: IState = {
    running: false,
    activeStep: null,
    initialized: false,
    lastUpdatedStep: null,
  }
  state: IState = { ...this.initialState };
  defaultDriverOptions: Config = {
    showButtons: ['close'],
    overlayOpacity: 0.3,
  };

  get steps() { return [ ...steps ] }

  constructor(options: IOptions = {}) {

    steps = []

    this.options.renderToolbar = options.renderToolbar === false ? false : true
    this.options.renderStepsStyle = options.renderStepsStyle
    this.options.interval = options.interval

    StepForm.init()
    CheckStepPrompt.init()

    window.addEventListener('keydown', EventHandlers.handleKeydown)

    if(this.options.renderToolbar) {
      Toolbar.init()
      window.addEventListener(Steps.eventTypes.STEP_MOVE, EventHandlers.handleStepMoved)
      window.addEventListener(Steps.eventTypes.STEP_DOUBLECLICK, EventHandlers.handleStepDoubleclick)
      window.addEventListener(Steps.eventTypes.STEP_CLICK, EventHandlers.handleStepClick)
      window.addEventListener(Steps.eventTypes.STEP_CTRL_CLICK, EventHandlers.handleStepCtrlClick)
      window.addEventListener(PlanStepForm.eventTypes.PLAN_STEP, EventHandlers.handlePlanStep)
    }

    if(options.steps) {
      this.setSteps(values<any>(options.steps))
    }

    this.state.initialized = true
  }

  static getInstance(options: IOptions = {}): Demo {
    if (!Demo.instance && !isEmpty(options)) {
      Demo.instance = new Demo(options)
    }
    return Demo.instance
  }

  addStep(step: IStep = {} as any) {
    this.insertStep(step, steps.length)
  }

  addHighlightStep(step: Omit<IHighlightingStep, 'type'> = {} as any) {
    this.addStep({
      ...step,
      title: step.title || `Step ${steps.length}`,
      type: 'highlight',
    })
  }

  async pickStep(): Promise<void> {
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

    if (this.state.activeStep !== null) {
      step = await StepForm.getPrompt({
        title: steps[this.state.activeStep].title,
        xPath
      } as IElementBoundStep)
    } else {
      step = await StepForm.getPrompt(xPath)
    }

    if (!step) {
      return
    }

    if (this.state.activeStep !== null) {
      await this.updateStep(this.state.activeStep, step)

      if (steps[this.state.activeStep + 1]?.isFilled === false) {
        this.select(this.state.activeStep + 1)
      } else {
        this.select(null)
      }
      return
    } else {
      this.addStep(step)
    }
  }

  setSteps(steps: IStep[] | { [key: number]: IStep }) {
    if (isNil(steps) || isEmpty(steps)) {
      return
    }

    this.stop()
    values(steps).forEach((step: IStep) => this.insertStep({ ...step, xPathCheck: false }))
    this.select(0)
  }

  insertStep(step: IStep = {} as any, index?: number) {
    const adjustedStep = new Step({
      ...step,
      title: step.title || `Custom step ${index}`,
      type: step.type || 'click',
      list: typeof step.list === 'boolean' ? step.list : true,
    })
    const index1 = !isNil(index) ? Number(index) : this.state.activeStep !== null ? this.state.activeStep + 1 : steps.length
    steps = insert(index1, adjustedStep, steps)
    this.state.lastUpdatedStep = index1
    this.dispatchStepsChangedEvent()
  }

  async updateStep(title?: string | number, step?: Partial<IStep>) {
    if (!this.state.initialized) {
      throw new Error('DevTools: DemoTools is not initialized')
    }

    if (this.state.running) {
      this.pause()
    }
    let index
    if (!isNil(title)) {
      if (isNaN(Number(title))) {
        index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), steps)
      } else {
        index = title
      }
    } else {
      index = Number(isNil(this.state.activeStep) ? this.state.lastUpdatedStep : this.state.activeStep || 0)
    }

    if (index >= steps.length || index < 0) {
      return
    }

    const updatedStep = step || await StepForm.getPrompt(steps[index])

    this.state.lastUpdatedStep = index
    steps[index] = new Step({ ...steps[index], ...updatedStep })
    this.dispatchStepsChangedEvent()
  }

  removeStep(title: string | number) {
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
    if (this.state.activeStep === index) {
      this.select(null)
    }
    this.dispatchStepsChangedEvent()
  }

  removeAllSteps() {
    steps = []
    this.dispatchStepsChangedEvent()
  }

  doStep(title: string | number) {
    if (!this.state.initialized) {
      throw new Error('DevTools: DemoTools is not initialized')
    }
    this.state.lastUpdatedStep = null
    let index
    if (isNaN(Number(title))) {
      index = findIndex((step: IStep) => step.title.toLowerCase().includes((title as string).toLowerCase()), steps)
    } else {
      index = title
    }
    if (index === -1 || index >= steps.length) {
      return
    }

    this.select(index)

    if(steps[index].type === 'highlight') {
      this.highlight(index)
    } else if (steps[index].type === 'click') {
      Dom.click((steps[index] as IClickStep))
    } else if (steps[index].type === 'rightclick') {
      Dom.rightClick((steps[index] as IClickStep))
    } else if (steps[index].type === 'hover') {
      Dom.hover((steps[index] as IClickStep))
    } else if (steps[index].type === 'setValue') {
      Dom.setValue(steps[index], steps[index].value)
    } else if (steps[index].type === 'keyboard') {
      Dom.keydown(steps[index], steps[index].keyboardKey)
    } else {
      (steps[index] as ICustomStep)?.func()
    }
  }

  async run(options: IRunOptions = {}) {
    this.dispatchRunEvent()
    this.options = { ...this.options, ...options }
    this.state.running = true
    for (let i = options?.from || this.state.activeStep || 0; i <= (options?.till || steps.length - 1); i++) {
      if(!this.state.running) {
        break
      }
      this.doStep(i)
      const step = steps[i]
      await new Promise(resolve => setTimeout(resolve, step?.interval || this.options.interval || Demo.defaultInterval))

      if (step.type === 'highlight') {
        this.unhighlight()
      }
    }

    if (this.state.activeStep === (options?.till || steps.length - 1)) {
      this.stop()
    }
  }

  jump(index: number) {
    if (index < 0 || index >= steps.length) {
      return
    }
    this.doStep(index)
  }

  select(index: number | null) {
    this.state.activeStep = index
    this.dispatchActiveStepChangedEvent()
  }

  swap(index1: number, index2: number) {
    if (isNil(index1) || isNil(index2) || index1 === index2 || index1 < 0 || index2 < 0 || index1 >= steps.length || index2 >= steps.length) {
      return
    }
    const tmp = steps[Number(index1)]
    steps[Number(index1)] = steps[Number(index2)]
    steps[Number(index2)] = tmp
    this.dispatchStepsChangedEvent()

    if (index1 === this.state.activeStep || index2 === this.state.activeStep) {
      if (index1 === this.state.activeStep) {
        this.select(index2)
      } else {
        this.select(index1)
      }
    }
  }

  move(index1: number, index2?: number) {
    const index = !isNil(index2) ? index1 : this.state.activeStep
    const tmp = steps[index]
    steps.splice(index, 1)
    steps.splice(!isNil(index2) ? index2 : index1, 0, tmp)
    this.dispatchStepsChangedEvent()
  }

  copy(index1?: number, index2?: number) {
    const index = !isNil(index1) ? index1 : this.state.activeStep
    this.insertStep(steps[index], !isNil(index2) ? index2 : index1 + 1)
  }

  stop() {
    this.pause()
    this.state.lastUpdatedStep = null
    this.unhighlight()
    this.select(null)
    this.dispatchStopEvent()
  }

  pause() {
    this.state.running = false
  }

  resume() {
    this.run()
  }

  destroy() {
    this.removeAllSteps()
    this.close()
  }

  close() {
    this.stop()
    this.state = { ...this.initialState }
    window.removeEventListener('keydown', EventHandlers.handleKeydown)
    if(this.options.renderToolbar) {
      window.removeEventListener(Steps.eventTypes.STEP_MOVE, EventHandlers.handleStepMoved)
      window.removeEventListener(Steps.eventTypes.STEP_DOUBLECLICK, EventHandlers.handleStepDoubleclick)
      window.removeEventListener(Steps.eventTypes.STEP_CLICK, EventHandlers.handleStepClick)
      window.removeEventListener(Steps.eventTypes.STEP_CTRL_CLICK, EventHandlers.handleStepCtrlClick)
      window.removeEventListener(PlanStepForm.eventTypes.PLAN_STEP, EventHandlers.handlePlanStep)
    }
    this.options = {}
    Toolbar.destroy()
    CheckStepPrompt.destroy()
    StepForm.destroy()
    Demo.instance = undefined
  }

  highlight(stepIndex: number) {
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

    const element = this.appendHighlightArea(area || areaNew)

    if (!element) {
      return
    }

    this.driver = this.Driver({
      ...this.defaultDriverOptions,
      steps: [{
        element,
        popover: {
          description: title,
        }
      }]
    })

    this.driver.drive()
  }

  unhighlight() {
    if (this.driver) {
      this.driver.destroy()
    }
    const highlightArea = document.querySelectorAll('#demo-tools-highlight-area')
    if (highlightArea) {
      highlightArea.forEach(el => el.remove())
    }
  }

  appendHighlightArea(area: IArea): HTMLDivElement {
    const { left, top, width, height } = area
    const style = `position: absolute; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`
    const div = document.createElement('div')
    div.setAttribute('style', style)
    div.setAttribute('id', 'demo-tools-highlight-area')
    document.body.appendChild(div)
    return div
  }

  check(selector: string | IArea): void {
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

    this.driver = this.Driver({
      ...this.defaultDriverOptions,
      onDestroyed: () => document.querySelectorAll('#demo-tools-highlight-area')?.forEach(el => { el.remove() })
    })
    this.driver.highlight({
      element,
      popover: {
        description: is(String, selector) ?
          `Element: ${element.nodeName.toLowerCase()}${selector}<br />parent element: ${element.parentElement?.nodeName.toLowerCase()}.${Array.from(element.parentElement?.classList).join('.')}` :
          'Appended area',
      }
    })
  }

  printSteps() {
    console.table(steps.map((step) => ({ title: step.title, type: step.type })))
  }

  checkStep(index: number) {
    const step = steps[index]
    CheckStepPrompt.getPrompt(step)
      .then(result => {
        if (result) {
          this.updateStep(index, result)
        }
      })
  }

  ignoreXPathError(index: number) {
    this.updateStep(index, { xPathCheck: 'ignored' })
  }

  dispatchStepsChangedEvent() {
    window.dispatchEvent(new CustomEvent('Demo:StepsChanged', { detail: { steps: steps } }))
  }

  dispatchActiveStepChangedEvent() {
    window.dispatchEvent(new CustomEvent('Demo:ActiveStepChanged', { detail: { activeStep: this.state.activeStep } }))
  }

  dispatchRunEvent() {
    window.dispatchEvent(new CustomEvent('Demo:DemoRun'))
  }

  dispatchStopEvent() {
    window.dispatchEvent(new CustomEvent('Demo:DemoStop'))
  }
}


abstract class EventHandlers {
  static handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.altKey) {
      switch(e.key) {
        case 'p': {
          if(DemoTools.demo.state.running) {
            DemoTools.demo.pause()
            return
          }
          DemoTools.demo.pickStep()
          break;
        }
        case 'r': {
          DemoTools.demo.run()
          break;
        }
        case 's': {
          DemoTools.demo.stop()
          break;
        }
        case 'ArrowRight': {
          if (DemoTools.demo.state.activeStep !== null && DemoTools.demo.state.activeStep < steps.length - 1) {
            if (e.shiftKey) {
              DemoTools.demo.select(DemoTools.demo.state.activeStep + 1)
            } else {
              DemoTools.demo.jump(DemoTools.demo.state.activeStep + 1)
            }
          }
          break;
        }
        case 'ArrowLeft': {
          if (DemoTools.demo.state.activeStep !== null && DemoTools.demo.state.activeStep > 0) {
            if (e.shiftKey) {
              DemoTools.demo.select(DemoTools.demo.state.activeStep - 1)
            } else {
              DemoTools.demo.jump(DemoTools.demo.state.activeStep - 1)
            }
          }
          break;
        }
        case 'ArrowUp': {
          DemoTools.demo.swap(DemoTools.demo.state.activeStep, DemoTools.demo.state.activeStep - 1)
          break;
        }
        case 'ArrowDown': {
          DemoTools.demo.swap(DemoTools.demo.state.activeStep, DemoTools.demo.state.activeStep + 1)
          break;
        }
        case 'u': {
          if (steps[DemoTools.demo.state.activeStep].isElementBound) {
            DemoTools.demo.updateStep()
          }
          break;
        }
        case 'd': {
          DemoTools.demo.removeStep(DemoTools.demo.state.activeStep)
          break;
        }
        case 'c': {
          DemoTools.demo.checkStep(DemoTools.demo.state.activeStep)
          break;
        }
      }
    }
  }

  static handleStepMoved(e: CustomEvent) {
    DemoTools.demo.move(e.detail.from, e.detail.to)
  }

  static handleStepDoubleclick(e: CustomEvent) {
    DemoTools.demo.jump(e.detail.index)
  }

  static handleStepClick(e: CustomEvent) {
    DemoTools.demo.pause()
    if (e.detail.index === DemoTools.demo.state.activeStep) {
      DemoTools.demo.select(null)
    } else {
      DemoTools.demo.select(e.detail.index)
    }
  }

  static handleStepCtrlClick(e: CustomEvent) {
    DemoTools.demo.updateStep(e.detail.index)
  }

  static handlePlanStep(e: CustomEvent) {
    DemoTools.demo.addStep(e.detail)
  }
}