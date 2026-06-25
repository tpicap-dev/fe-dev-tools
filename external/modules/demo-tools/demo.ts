import {
  any,
  clone, find,
  findIndex,
  insert,
  is,
  isEmpty,
  isNil, pick, propEq,
  remove,
  values
} from 'ramda'
import { Config, driver } from 'driver.js'
import 'driver.js/dist/driver.css'
// import eruda, { ConsoleConfig, Eruda, ErudaConsole, InitDefaults } from 'eruda'

import Steps, { StepEditForm } from './steps/steps'
import StepForm from './demo-tools-step-form'
import { getElementByXPath } from '../../utils/utils'
import Step, { IGetReduxActionStepParams } from 'external/modules/demo-tools/step'
import CheckStepPrompt from 'external/modules/demo-tools/demo-tools-check-step-prompt'
import PlanStepForm from 'external/modules/demo-tools/steps/plan-step-form'
import Dom from 'external/modules/demo-tools/dom/dom'
import Toolbar, { IToolbarOptions } from 'external/modules/demo-tools/toolbar'
// import Terminal from 'external/modules/demo-tools/terminal'
import DemoTools from 'external/modules/demo-tools/demo-tools'
import MenuBar from 'external/modules/demo-tools/menu-bar/menu-bar'
import DemoStorage from 'external/modules/demo-tools/storage'
import Console, { defaultConsoleOptions, IConsoleOptions } from 'external/modules/demo-tools/console/console'
import Highlighter from 'external/modules/demo-tools/highlighter/highlighter'
import MouseCursor from 'external/modules/demo-tools/dom/mouse-cursor'

export interface IStepBase {
  title: string;
  description?: string;
  interval?: number;
  type: 'highlight' | 'custom' | 'click' | 'rightclick' | 'hover' | 'setValue' | 'keyboard' | 'section' | 'stop' | 'wait' | 'scroll';
  list?: boolean;
  customData?: any;
  labels?: 'new'[];
}

export interface ICustomStep extends IStepBase {
  func: () => void;
}

export interface IElementBoundStepBase extends IStepBase {
  selector?: string;
  xPath?: string;
  hasCorrectXPath: boolean;
  hasCorrectCoordinates: boolean;
  hasCorrectSelector: boolean;
  element?: Pick<HTMLElement, 'classList' | 'id' | 'localName'>;
  xPathCheck: boolean | 'ignored';
  coordCheck: boolean | 'ignored';
  keyboardKey?: 'Enter' | 'Escape' | 'Tab' | 'Delete' | 'Backspace' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
  scrollAxe?: 'x' | 'y';
  scrollBy?: number;
  elementX: number;
  elementY: number;
}

export interface IClickStep extends IElementBoundStepBase {}

export interface IHighlightingStep extends IElementBoundStepBase {
  area?: IArea;
  shiftX?: number;
  shiftY?: number;
  shiftWidth?: number;
  shiftHeight?: number;
  areaStyle?: any;
}

export interface IInputBoundStep extends IElementBoundStepBase {
  value: string | number;
}

export interface ISectionStep extends IStepBase {}

export type IElementBoundStep = IHighlightingStep | IClickStep | IInputBoundStep
export type IStep = IElementBoundStep | ICustomStep | ISectionStep

interface IArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface IOptions {
  title: string;
  renderToolbar?: boolean;
  renderConsole?: boolean;
  renderStepsStyle?: any;
  renderMouseCursor?: boolean;
  interval?: number;
  steps?: IStep[];
  skipChecks?: boolean;
  customData?: any;
  verbose?: boolean;
  editable?: boolean;
  instructions?: string;
  consoleOptions?: Partial<IConsoleOptions>;
  mode?: 'compose' | 'present';
  toolbarOptions?: IToolbarOptions;
// erudaOptions?: Partial<InitDefaults>
}

interface IRunOptions extends IOptions {
  from?: number;
  till?: number;
}

interface IState {
  running: boolean;
  activeStep: number | null;
  lastUpdatedStep: number | null;
}

interface IAddReduxActionStepParams extends IGetReduxActionStepParams {}

let steps: Step[] = [];

export default class Demo {
  private static instance: Demo;
  static defaultInterval = 2000;
  Driver = driver;
  driver: any;
  stepList = Steps;
  stepForm = StepForm;
  dom = Dom;
  highlighter = Highlighter;
  // terminal = Terminal;
  initialState: IState = {
    running: false,
    activeStep: null,
    lastUpdatedStep: null,
  }
  state: IState = { ...this.initialState };
  defaultDriverOptions: Config = {
    showButtons: ['close'],
    overlayOpacity: 0.4,
    popoverClass: 'demo-tools-driver-popover',
  };
 // eruda: Eruda = eruda;
  console = Console;

  get steps() { return [ ...steps ] }

  get customData() {
    return Options.getInstance().customData
  }

  get title() { return Options.getInstance().title }

  get options() { return Options.getInstance() }

  constructor(options: IOptions = {} as any) {

    steps = []

    Options.setInstance(options)

    StepForm.init()
    CheckStepPrompt.init()

    window.addEventListener('keydown', EventHandlers.handleKeydown)

    if(Options.getInstance().renderToolbar) {
      Toolbar.init()
      window.addEventListener('beforeunload', EventHandlers.handleBeforeUnload)
      window.addEventListener(Steps.eventTypes.STEP_MOVE, EventHandlers.handleStepMoved)
      window.addEventListener(Steps.eventTypes.STEP_COPY, EventHandlers.handleStepCopied)
      window.addEventListener(Steps.eventTypes.STEP_DOUBLECLICK, EventHandlers.handleStepDoubleclick)
      window.addEventListener(Steps.eventTypes.STEP_CLICK, EventHandlers.handleStepClick)
      window.addEventListener(Steps.eventTypes.STEP_CTRL_CLICK, EventHandlers.handleStepCtrlClick)
      window.addEventListener(PlanStepForm.eventTypes.PLAN_STEP, EventHandlers.handlePlanStep)
      window.addEventListener(MenuBar.eventTypes.RESTORING_APP_STATE_STEP_CLICK, EventHandlers.handleRestoringAppStateStepClick)
      window.addEventListener(MenuBar.eventTypes.MODE_CLICK, EventHandlers.handleModeClick)
      window.addEventListener(MenuBar.eventTypes.EDIT_CLICK, EventHandlers.handleEditClick)
      window.addEventListener(MenuBar.eventTypes.VERBOSE_CLICK, EventHandlers.handleVerboseClick)
      window.addEventListener(MenuBar.eventTypes.REFERSH_DEMO_CLICK, EventHandlers.handleRefreshDemoClick)
      window.addEventListener(MenuBar.eventTypes.CLOSE_DEMO_CLICK, EventHandlers.handleCloseDemoClick)
      window.addEventListener(Toolbar.eventTypes.ELEMENT_SET, EventHandlers.handleToolbarElementSet)
      window.addEventListener(StepEditForm.eventTypes.CHANGE, EventHandlers.handleStepEditFormChange)
    } else {
      if(options.steps) {
        this.setSteps(values<any>(options.steps))
      }
    }
  }

  static getInstance(options: IOptions = {} as any): Demo {
    if (!Demo.instance) {
      Demo.instance = new Demo(options)
    }
    return Demo.instance
  }

  setOptions(newOptions: Partial<IOptions> = {}) {
    Options.setInstance({ ...Options.getInstance(), ...newOptions })
    this.dispatchOptionsChangedEvent()
  }

  /* Options aliases: begin */
  edit() {
    if (this.options.editable === false) {
      this.setOptions({ editable: true })
    } else {
      this.setOptions({ editable: false })
    }
  }

  verbose() {
    if (this.options.verbose === false) {
      this.setOptions({ verbose: true })
    } else {
      this.setOptions({ verbose: false })
    }
  }
  /* Options aliases: end */

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
    const step = await Step.pickStep(steps[this.state.activeStep])

    if (!step) {
      return
    }

    if (this.state.activeStep !== null) {
      this.updateStep(this.state.activeStep, step)

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

  addReduxActionsStep(params: IAddReduxActionStepParams) {
    if (isNil((window as any)?.store)) {
      throw new Error('DemoTools: Redux store is not initialized')
    }

    this.insertStep(Step.getReduxActionStep(params), 0)
  }

  addRestoringAppStateStep() {
    this.insertStep(Step.getRestoringAppStateStep(), 0)
  }

  addRestoringGridDataStep() {
    this.insertStep(Step.getRestoringGridDataStep(), 0)
  }

  addStopStep() {
    this.insertStep({ title: 'Stop', type: 'stop', interval: 0 }, this.state.activeStep !== null ? this.state.activeStep + 1 : steps.length)
  }

  // 1. Add Restoring App State Step
  // 2. Isolate FE
  // 3. Deisolate FE
  addPreset1() {
    this.addRestoringAppStateStep()
    this.addPreset3()
  }

  // 1. Add Restoring Grid Data Step
  // 2. Isolate FE
  // 3. Deisolate FE
  addPreset2() {
    this.addRestoringGridDataStep()
    this.addPreset3()
  }

  // 2. Isolate FE
  // 3. Deisolate FE
  addPreset3() {
    this.insertStep({ func: () => (window as any).store.isolateFe(), type: 'custom', title: 'Isolate FE', list: false }, 0)
    this.addStep({ func: () => (window as any).store.deisolateFe(), type: 'custom', title: 'Deisolate FE', list: false })
    this.setOptions({ verbose: true })
  }

  addManualStep(title: string) {
    this.insertStep({ title, type: 'wait' }, this.state.activeStep !== null ? this.state.activeStep + 1 : steps.length)
  }

  async restoreStep(title: string, index?: number) {
    if (!title) {
      return
    }
    const step = await DemoStorage.getStep(title)

    if (!step) {
      return
    }

    this.insertStep(step, isNil(index) ? steps.length : index)
  }

  setSteps(newSteps: IStep[] | { [key: number]: IStep }) {
    if (isNil(newSteps) || isEmpty(newSteps)) {
      return
    }

    if (this.state.running) {
      this.stop()
    }
    // values(steps).forEach((step: IStep) => this.insertStep({ ...step, xPathCheck: false }))
    steps = values(newSteps).map((step: IStep, index) => new Step({
      ...step,
      title: step.title || `Custom step ${index}`,
      type: step.type || 'click',
      list: typeof step.list === 'boolean' ? step.list : true,
    }))
    this.dispatchStepsChangedEvent()
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

  async updateStep(title?: string | number, step?: Partial<IStep> | string) {
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

    let updatedStep

    if (typeof step === 'string') {
      const step1 = new Step({ ...steps[index], xPath: step, selector: null })
      updatedStep = await StepForm.getPrompt(step1)
    } else if (is(Object, step)) {
      updatedStep = step
    } else {
      updatedStep = await StepForm.getPrompt(steps[index])
    }

    this.state.lastUpdatedStep = index

    if (!isNil((updatedStep as Step)?.xPath) && (updatedStep as Step).xPath !== steps[index].xPath) {
      (updatedStep as Step).xPathCheck = false
    }
    steps[index] = new Step({ ...steps[index], ...updatedStep })
    this.dispatchStepChangedEvent(index)
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

  async doStep(title: string | number) {
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

    if (!steps[index].elementBoundCheck) {
      this.stop()
      this.dispatchElementBoundStepCheckFailEvent(index)
      return
    }

    if(steps[index].type === 'highlight') {
      this.highlight(index)
    } else if (steps[index].type === 'click') {
      await Dom.click((steps[index] as IClickStep))
    } else if (steps[index].type === 'rightclick') {
      await Dom.rightClick((steps[index] as IClickStep))
    } else if (steps[index].type === 'hover') {
      await Dom.hover((steps[index] as IClickStep))
    } else if (steps[index].type === 'setValue') {
      await Dom.setValue(steps[index], steps[index].value)
    } else if (steps[index].type === 'keyboard') {
      Dom.keydown(steps[index], steps[index].keyboardKey)
    } else if (steps[index].type === 'scroll'){
      Dom.scrollBy(steps[index], steps[index].scrollAxe, steps[index].scrollBy)
    } else if (steps[index].type === 'section') {
      return
    } else if (steps[index].type === 'stop') {
      this.stop()
    } else if (steps[index].type === 'wait') {
      this.pause()
      this.state.activeStep = index + 1
    } else {
      (steps[index] as ICustomStep)?.func()
    }
  }

  async run(options: IRunOptions = {} as any) {
    this.dispatchRunEvent()
    Options.setInstance({ ...Options.getInstance(), ...options })
    this.state.running = true
    for (let i = options?.from || this.state.activeStep || 0; i <= (options?.till || steps.length - 1); i++) {
      await this.doStep(i)
      const step = steps[i]
      await new Promise(resolve => setTimeout(resolve, (!isNil(step?.interval) && !isNaN(step?.interval) ? step?.interval : (Options.getInstance().interval || Demo.defaultInterval))))

      if (step.type === 'highlight') {
        this.unhighlight()
      }
      if(!this.state.running) {
        return
      }
    }

    if (this.state.activeStep === (options?.till || steps.length - 1)) {
      this.stop()
      this.dispatchCompleteEvent()
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
    this.insertStep(clone(steps[index]), !isNil(index2) ? index2 : index1 + 1)
  }

  stop() {
    this.unhighlight()
    this.state.lastUpdatedStep = null
    this.select(null)
    MouseCursor.destroy()

    if (this.state.running) {
      this.pause()
      this.dispatchStopEvent()
    }
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
    if(Options.getInstance().renderToolbar) {
      window.removeEventListener('beforeunload', EventHandlers.handleBeforeUnload)
      window.removeEventListener(Steps.eventTypes.STEP_MOVE, EventHandlers.handleStepMoved)
      window.removeEventListener(Steps.eventTypes.STEP_COPY, EventHandlers.handleStepCopied)
      window.removeEventListener(Steps.eventTypes.STEP_DOUBLECLICK, EventHandlers.handleStepDoubleclick)
      window.removeEventListener(Steps.eventTypes.STEP_CLICK, EventHandlers.handleStepClick)
      window.removeEventListener(Steps.eventTypes.STEP_CTRL_CLICK, EventHandlers.handleStepCtrlClick)
      window.removeEventListener(PlanStepForm.eventTypes.PLAN_STEP, EventHandlers.handlePlanStep)
      window.removeEventListener(MenuBar.eventTypes.RESTORING_APP_STATE_STEP_CLICK, EventHandlers.handleRestoringAppStateStepClick)
      window.removeEventListener(MenuBar.eventTypes.MODE_CLICK, EventHandlers.handleModeClick)
      window.removeEventListener(MenuBar.eventTypes.EDIT_CLICK, EventHandlers.handleEditClick)
      window.removeEventListener(MenuBar.eventTypes.VERBOSE_CLICK, EventHandlers.handleVerboseClick)
      window.removeEventListener(MenuBar.eventTypes.REFERSH_DEMO_CLICK, EventHandlers.handleRefreshDemoClick)
      window.removeEventListener(MenuBar.eventTypes.CLOSE_DEMO_CLICK, EventHandlers.handleCloseDemoClick)
      window.removeEventListener(Toolbar.eventTypes.ELEMENT_SET, EventHandlers.handleToolbarElementSet)
      window.removeEventListener(StepEditForm.eventTypes.CHANGE, EventHandlers.handleStepEditFormChange)
    }
    Options.setInstance({} as any)
    Toolbar.destroy()
    CheckStepPrompt.destroy()
    StepForm.destroy()
    Console.destroy()
    // try { eruda.destroy() } catch (e) {}
    Demo.instance = undefined
  }

  highlight(stepIndex: number) {
    if (isNil(steps[stepIndex])) {
      return
    }
    const { title, description, selector, xPath, area, shiftX, shiftY, shiftHeight, shiftWidth } = steps[stepIndex] as IHighlightingStep

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

    const element = this.appendHighlightArea(area || areaNew, steps[stepIndex].areaStyle)

    if (!element) {
      return
    }

    this.driver = this.Driver({
      ...this.defaultDriverOptions,
      steps: [{
        element,
        popover: {
          description: description || title,
        },
        onDeselected: () => {
          this.unhighlight()
        },
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

  appendHighlightArea(area: IArea, customStyle?: any): HTMLDivElement {
    const {left, top, width, height} = area
    const style = `position: absolute; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`
    const div = document.createElement('div')
    div.setAttribute('style', style)
    if (customStyle) {
      Object.assign(div.style, customStyle)
    }
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

  checkStep(index: number, event?: MouseEvent) {
    event?.stopPropagation()
    const step = steps[index]

    if (step.hasCorrectXPath) {
      this.updateStep(index, { xPathCheck: true })
      return
    }

    if (step.hasCorrectCoordinates) {
      this.updateStep(index, { coordCheck: true })
      return
    }

    this.pause()

    CheckStepPrompt.getPrompt(step)
      .then(result => {
        if (result) {
          this.updateStep(index, { xPathCheck: true })
        }
      })
  }

  fixStepXPath(index: number, event?: MouseEvent, { interactive = true } = {} as any) {
    event?.stopPropagation()
    const step = steps[index]
    const element = getElementByXPath(step.xPath)
    if (!element) {
      return
    }
    const selector = `${step.element.localName}${step.element.classList?.length ? `.${values(step.element.classList).join('.')}` : ''}`
    const elementNew = element?.closest(selector) ||
      element.parentElement?.querySelector(selector)

    if (!elementNew) {
      return
    }

    const hierarchy = [elementNew]
    let current = elementNew.parentElement
    while (current) {
      hierarchy.push(current)
      current = current.parentElement
    }

    let xPath = ''

    hierarchy.reverse().forEach((el) => {
      let index = 0
      if (el.parentElement) {
        index = Array.from(el.parentElement.children).indexOf(el)
      }
      xPath += `/*[${index + 1}]`
    })

    if (isEmpty(xPath)) {
      return
    }

    if (!interactive) {
      const elementFix = getElementByXPath(xPath)
      this.updateStep(index, { xPath: xPath, element:  pick(['classList', 'id', 'localName'], elementFix) })
      return
    }

    const stepFix = { xPath } as Step
    CheckStepPrompt.getPrompt(stepFix, 'Anticipated element')
      .then(result => {
        if (result) {
          this.updateStep(index, result)
        }
      })
  }

  ignoreXPathError(index: number, event: MouseEvent) {
    event.stopPropagation()
    this.updateStep(index, { xPathCheck: 'ignored' })
  }

  dispatchOptionsChangedEvent() {
    window.dispatchEvent(new CustomEvent('Demo:OptionsChanged'))
  }

  dispatchStepsChangedEvent() {
    window.dispatchEvent(new CustomEvent('Demo:StepsChanged', { detail: { steps: steps } }))
  }

  dispatchStepChangedEvent(index) {
    window.dispatchEvent(new CustomEvent('Demo:StepChanged', { detail: { step: steps[index], index } }))
  }

  dispatchActiveStepChangedEvent() {
    window.dispatchEvent(
      new CustomEvent(
        'Demo:ActiveStepChanged',
        { detail: { activeStep: this.state.activeStep, scrollntoView: this.state.running } }
      )
    )
  }

  dispatchRunEvent() {
    window.dispatchEvent(new CustomEvent('Demo:DemoRun'))
  }

  dispatchStopEvent() {
    window.dispatchEvent(new CustomEvent('Demo:DemoStop'))
  }

  dispatchElementBoundStepCheckFailEvent(index: number) {
    window.dispatchEvent(
      new CustomEvent(
        'Demo:ElementBoundStepCheckFail',
        { detail: { step: steps[index], index } }
      )
    )
  }

  dispatchCompleteEvent() {
    window.dispatchEvent(new CustomEvent('Demo:DemoComplete'))
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
        case 'm': {
          DemoTools.refresh({ mode: (Options.getInstance().mode === 'compose' ? 'present' : 'compose') })
          break;
        }
        case 'e': {
          DemoTools.demo.edit()
          DemoTools.demo.setOptions({ verbose: true })
          break;
        }
        case 'v': {
          DemoTools.demo.verbose()
          break;
        }
        case 'ArrowRight': {
          if (DemoTools.demo.state.activeStep !== null && DemoTools.demo.state.activeStep < steps.length - 1) {
            if (steps[DemoTools.demo.state.activeStep].type === 'highlight') {
              DemoTools.demo.unhighlight()
            }
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
            if (steps[DemoTools.demo.state.activeStep].type === 'highlight') {
              DemoTools.demo.unhighlight()
            }
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
        case 'h': {
          DemoTools.help()
          break;
        }
      }
    }
  }

  static handleToolbarElementSet() {

    if(Options.getInstance().steps) {
      DemoTools.demo.setSteps(values<any>(Options.getInstance().steps))
    }

    if (Options.getInstance().renderConsole) {
      Console.init()
    }
  }

  static handleStepMoved(e: CustomEvent) {
    DemoTools.demo.move(e.detail.from, e.detail.to)
  }

  static handleStepCopied(e: CustomEvent) {
    DemoTools.demo.copy(e.detail.from, e.detail.to)
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

  static handleRestoringAppStateStepClick() {
    DemoTools.demo.addRestoringAppStateStep()
  }

  static handleModeClick() {
    DemoTools.refresh({ mode: (Options.getInstance().mode === 'compose' ? 'present' : 'compose') })
  }

  static handleVerboseClick() {
    DemoTools.demo.verbose()
  }

  static handleEditClick() {
    DemoTools.demo.edit()
    DemoTools.demo.setOptions({ verbose: true })
  }

  static handleRefreshDemoClick() {
    DemoTools.refresh()
  }
  static handleCloseDemoClick() {
    DemoTools.close()
  }

  static handleStepEditFormChange(e: CustomEvent) {
    DemoTools.demo.updateStep(e.detail.index, { [e.detail.field]: e.detail.value })
  }

  static handleBeforeUnload() {
    if ((window as any).store?.isFeIsolated()) {
      (window as any).store.deisolateFe()
    }
  }
}

class Options implements IOptions {
  title: string;
  renderToolbar: boolean = true;
  renderStepsStyle: any = {};
  interval: number = 2000;
  steps: IStep[] = [];
  skipChecks: boolean = false;
  renderConsole: boolean = false;
  customData: any = undefined;
  verbose: boolean = false;
  editable: boolean = false;
  instructions: string | undefined = undefined;
  consoleOptions?: IConsoleOptions = {};
  mode?: 'compose' | 'present' = 'compose';
  toolbarOptions?: IToolbarOptions = {};
  // erudaOptions?: InitDefaults = {};
  renderMouseCursor?: boolean = true;

  static instance: Options = {} as any;

  static getInstance(options: IOptions = {} as any): Options {
    if (!Options.instance) {
      Options.setInstance(options)
    }
    return Options.instance
  }

  static setInstance(options: IOptions) {
    Options.instance.mode = options.mode ? options.mode : 'compose'
    Options.instance.title = options.title;
    Options.instance.renderToolbar = options.renderToolbar === false ? false : true;
    Options.instance.renderStepsStyle = options.renderStepsStyle;
    Options.instance.interval = options.interval;
    Options.instance.steps = options.steps || [];
    Options.instance.skipChecks = options.skipChecks !== false;
    Options.instance.renderConsole = options.renderConsole === true;
    Options.instance.customData = options.customData;
    Options.instance.verbose = Options.instance.mode === 'present' ? false : options.verbose === true && options.editable !== true;
    Options.instance.editable = options.editable === true;
    Options.instance.instructions = options.instructions ? String(options.instructions) : undefined;
    Options.instance.consoleOptions = { ...defaultConsoleOptions, ...(Options.instance.consoleOptions || {}), ...(options.consoleOptions || {}) };
    Options.instance.toolbarOptions = { ...(Options.instance.toolbarOptions || {}), ...(options.toolbarOptions || {}) };
    Options.instance.toolbarOptions.showInfo = Options.instance.mode === 'present';
    // Options.instance.erudaOptions = options.erudaOptions || {};
    Options.instance.renderMouseCursor = options.renderMouseCursor === false ? false : true;
  }
}

export const options = Options.getInstance()