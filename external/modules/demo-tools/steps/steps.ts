import Sortable from 'sortablejs'
import { isNil, values } from 'ramda'

import PlanStepForm from 'external/modules/demo-tools/steps/plan-step-form'

import './steps.less'
import Step from './step'
import { default as DemoStep } from 'external/modules/demo-tools/step'
import { options } from 'external/modules/demo-tools/demo'
import { getElementByXPath } from 'external/utils/utils'
import Dom from 'external/modules/demo-tools/dom/dom'

export default class Steps {
  static area: HTMLElement = null
  static steps: Step[] = []
  static state = {
    initialized: false,
  }
  static eventTypes = {
    STEP_DOUBLECLICK: 'DemoTools:Steps:StepDoubleclick',
    STEP_MOVE: 'DemoTools:Steps:StepMove',
    STEP_COPY: 'DemoTools:Steps:StepCopy',
    STEP_CLICK: 'DemoTools:Steps:StepClick',
    STEP_CTRL_CLICK: 'DemoTools:Steps:StepCtrlClick',
    STEP_LIST_RENDERED: 'DemoTools:Steps:StepListRendered',
  }

  static init() {
    window.addEventListener('Demo:OptionsChanged', Steps.handleDemoToolsOptionsChanged)
    window.addEventListener('Demo:StepsChanged', Steps.handleDemoToolsStepsChanged)
    window.addEventListener('Demo:StepChanged', Steps.handleDemoToolsStepChanged)
    window.addEventListener('Demo:ActiveStepChanged', Steps.handleDemoToolsActiveStepChanged)
    window.addEventListener('Demo:ElementBoundStepCheckFail', Steps.handleDemoToolsElementBoundStepCheckFail)

    if (options.mode === 'compose') {
      PlanStepForm.init()
    }
    Steps.setElement()
    Steps.state.initialized = true
  }

  static handleDemoToolsOptionsChanged() {
    Steps.renderStepList()
  }

  static handleDemoToolsStepsChanged({ detail: { steps } }: CustomEvent<{ steps: (DemoStep)[] }>) {
    if (options.editable) {
      (Steps.steps || []).forEach((step, index) => {
        step.editForm?.destroy()
        Steps.steps[index].editForm = null
      })
    }
    Steps.steps = steps.map(step => new Step(step))
    Steps.renderStepList()
  }

  static handleDemoToolsStepChanged({ detail: { step, index } }: CustomEvent<{ step: DemoStep, index: number }>) {
    const updatedStep = new Step(step)
    updatedStep.editForm = Steps.steps[index].editForm
    Steps.steps[index] = updatedStep
    Steps.renderStep(index)
  }

  static handleDemoToolsActiveStepChanged({ detail: { activeStep, scrollntoView } }: CustomEvent<{ activeStep: Number | null, scrollntoView: boolean }>) {
    Steps.setActiveStep(activeStep, scrollntoView)
  }

  static handleStepDoubleClick(index) {
    window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_DOUBLECLICK, { detail: { index } }))
  }

  static handleDemoToolsElementBoundStepCheckFail({ detail: { step, index } }: CustomEvent<{ step: DemoStep, index: number }>) {
    Steps.markFailedElementBoundStep(step, index)
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
    const area = document.createElement('div')
    area.setAttribute('class', 'demo-tools-steps')

    const title = document.createElement('h3')
    title.innerHTML = 'Demo steps'
    title.setAttribute('class', 'demo-tools-steps-title')

    const list = Steps.getStepListElement()

    area.appendChild(title)

    if (options.mode === 'compose') {
      area.appendChild(PlanStepForm.area)
    }
    area.appendChild(list)

    Steps.area = area
    Steps.setupInteractivity()
  }

  static renderStepList() {
    if (!Steps.state.initialized) {
      throw new Error('DevTools: Steps are not initialized')
    }

    if (options.editable) {
      (Steps.steps || []).forEach((step, index) => {
        Steps.steps[index].editForm = new StepEditForm(step, index)
      })
    }

    const scrollTop = Steps.area.querySelector('.demo-tools-steps-list')?.scrollTop || 0
    Steps.unmountStepList()

    const list = Steps.getStepListElement()
    Steps.area.appendChild(list)
    Steps.setupInteractivity()
    list.scrollTo({
      top: scrollTop
    })
    window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_LIST_RENDERED))
  }

  static renderStep(index: number) {
    const stepEl = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step')[index]
    const newStepEl = Steps.getStepElement(index)
    stepEl.replaceWith(newStepEl)
    Steps.addStepEventListeners(newStepEl, index)
  }

  static setActiveStep(index, scrollntoView: boolean) {
    if (!isNil(index) && !Steps.steps[index].list && !(options.verbose || options.editable)) {
      return
    }
    const stepEls = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step')

    for (let i = 0; i < stepEls.length; i++) {
      if (!Steps.steps[i].list && !(options.verbose || options.editable)) {
        continue
      }
      stepEls[i].classList.remove('completed')
      stepEls[i].classList.remove('active')
    }

    if (isNil(index)) {
      return
    }

    for (let i = 0; i < index; i++) {
      if (!Steps.steps[i].list && !(options.verbose || options.editable)) {
        continue
      }
      stepEls[i].classList.add('completed')
      stepEls[i].classList.remove('active')
    }
    stepEls[index].classList.add('active')

    Steps.setActiveSection(index)

    if (scrollntoView) {
      stepEls[index].scrollIntoView({behavior: 'smooth', block: 'center'})
    }
  }

  static setActiveSection(activeStepIndex: number) {
    let index = activeStepIndex

    while(index >=0 && Steps.steps[index].type !== 'section') {
      index--;
    }

    if (index < 0) {
      return
    }
    const stepEls = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step')
    stepEls[index].classList.remove('completed')
    stepEls[index].classList.add('active')
  }

  static getStepListElement() {

    const list = document.createElement('div')
    list.setAttribute('style', 'overflow-y: auto; padding-left: 1px; display: flex; flex-direction: column; gap: 2px;')
    list.setAttribute('class', 'demo-tools-steps-list')
    Steps.steps.forEach((_, index) => {
      list.appendChild(Steps.getStepElement(index))
    })

    return list
  }

  static getStepElement (index: number) {
    const step = Steps.steps[index]
    const div = document.createElement('div')
    if (!step.list && !(options.verbose || options.editable)) {
      div.setAttribute('style', 'display: none;')
    }
    div.classList.add('demo-tools-step')
    div.classList.add(`type-${step.type}`)
    if (!step.isFilled) {
      div.classList.add('unfilled')
      div.setAttribute('title', 'This step is not properly defined')
    }

    const titleElement = document.createElement('div')
    const labelsElement = document.createElement('div')

    if (options.verbose && !options.editable) {
      if (!step.list) {
        titleElement.innerHTML = `<div>${index} ${step.title} <sub>unlisted</sub></div>`
      } else {
        titleElement.innerHTML = `<div>${index} ${step.title}</div>`
      }
    } else if (options.editable) {
      titleElement.appendChild(step.editForm.area)
    } else {
      titleElement.innerHTML = step.title
    }

    if (!options?.skipChecks && !step.elementBoundCheck) {
      if (step.xPathCheck === false && step.coordCheck === false) {
        const element = getElementByXPath(step.xPath)
        const selector = `${step.element.localName}${step.element.classList?.length ? `.${values(step.element.classList).join('.')}` : ''}`
        const elementNew = element?.closest(selector) ||
          element.parentElement?.querySelector(selector)

        div.classList.add('unavailable')
        div.setAttribute('title', `HTML Element looks unavailable:\n${step.xPathError}`)
        const buttons = []
        buttons.push(`<button onclick="window.demoTools.demo?.checkStep(${index}, event)">Check</button>`)
        if (elementNew){
          buttons.push(`<button onclick="window.demoTools.demo?.fixStepXPath(${index}, event)" title="Look around">Fix</button>`)
        }
        buttons.push(`<button onclick="window.demoTools.demo?.ignoreXPathError(${index}, event)">Ignore</button>`)
        div.appendChild(titleElement)
        div.innerHTML += `<div class="demo-tools-action-buttons">
            ${buttons.join('')}
          </div>`
      } else if (step.xPathCheck === 'ignored') {
        div.classList.add('ignored')
        div.setAttribute('title', 'XPath error is ignored')
        div.appendChild(titleElement)
      } else {
        div.appendChild(titleElement)
      }
    } else {
      div.appendChild(titleElement)
    }

    if (step.labels?.length) {
      const labels = step.labels.map(label => `<span class="demo-tools-step-label">${label}</span>`)
      labelsElement.innerHTML = labels.join('')
      div.appendChild(labelsElement)
    }
    return div
  }

  static markFailedElementBoundStep(step: DemoStep, index: number) {
    if (isNil(index) || isNil(step) || isNil(Steps.area)) {
      return
    }

    let selector = step.element.localName
      + (step.element.id ? `#${step.element.id}` : '')
      + step.element.classList?.length ? `.${values(step.element.classList).join('.')}` : ''

    const similarElements: HTMLElement[] = selector ?
      Array.from(document.querySelectorAll(selector)).filter((e: any) => e.checkVisibility()) as HTMLElement[] :
      []

    const stepEls = Steps.area.querySelectorAll('.demo-tools-steps-list .demo-tools-step')
    const stepEl = stepEls[index]
    stepEl.classList.add('unavailable')

    let title = 'HTML Element not found'
    let description = `<p>Selector: ${selector}</p>`;
    let highlightEl = stepEl;

    (window as any).demoTools.demo.driver = (window as any).demoTools.demo.Driver({
      showButtons: [],
      overlayOpacity: 0.4,
      popoverClass: 'demo-tools-driver-popover',
    });

    if (similarElements.length > 0) {
      title = 'Original HTML Element looks like not found'
      const elsArr = similarElements.slice(0, 50);
      (window as any).demoTools.demo.highlighter.items = elsArr.map((e) => ({
        element: e,
        actions: [{
          label: 'Ok',
          action: () => {
            (window as any).demoTools.demo?.updateStep(index, Dom.getElementXPath(e as HTMLElement))
          }
        }]
      }))

      let mostSimilarIndex = 0
      if (elsArr.length === 1) {
        description += `<p>
          Found 1 similar element 
          <div class="demo-tools-action-buttons">
            <button autofocus onclick="window.demoTools.demo.driver.destroy(); window.demoTools.demo?.updateStep(${index}, window.demoTools.demo.dom.getElementXPath(window.demoTools.demo.highlighter.items[0].element)); window.demoTools.demo.highlighter.destroy();">Ok</button>
          </div>
        </p>`
      } else {
        mostSimilarIndex = Dom.getClosestToXPathIndex(elsArr, step.xPath);
        description += `<p>
        Found ${similarElements.length} similar elements 
        <div class="demo-tools-action-buttons">
          <button autofocus onclick="window.demoTools.demo.driver.destroy(); window.demoTools.demo?.updateStep(${index}, window.demoTools.demo.dom.getElementXPath(window.demoTools.demo.highlighter.items[${mostSimilarIndex}].element)); window.demoTools.demo.highlighter.destroy();">Ok</button>
          <button onclick="window.demoTools.demo.driver.destroy(); window.demoTools.demo.highlighter.highlight();">Check All</button>
        </div>
      </p>`
      }

      highlightEl = (window as any).demoTools.demo.highlighter.items[mostSimilarIndex].element
    } else {
      description += '<p>No similar elements found</p>';
    }

    (window as any).demoTools.demo.driver.highlight({
      element: highlightEl,
      popover: {
        description: `<b>${title}</b>${description}`,
        onCloseClick: () => {
          (window as any).demoTools.demo.driver.destroy();
          (window as any).demoTools.demo.highlighter.destroy();
        }
      }
    })
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
    window.removeEventListener('Demo:StepChanged', Steps.handleDemoToolsStepChanged)
    window.removeEventListener('Demo:OptionsChanged', Steps.handleDemoToolsOptionsChanged)
    window.removeEventListener('Demo:StepChanged', Steps.handleDemoToolsStepChanged)
    window.removeEventListener('Demo:ElementBoundStepCheckFail', Steps.handleDemoToolsElementBoundStepCheckFail)
    Steps.area = null
    Steps.steps = []
    if (options.mode === 'compose') {
      PlanStepForm.destroy()
    }
    Steps.state.initialized = false
  }

  static setupInteractivity() {
    if (options.editable) {
      return
    }
    Sortable.create(Steps.area.querySelector('.demo-tools-steps-list'), {
      onEnd: (evt) => {
        if (evt?.originalEvent?.ctrlKey) {
          const newIndex = evt.newIndex < evt.oldIndex ? evt.newIndex : evt.newIndex + 1
          window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_COPY, {
            detail: {
              from: evt.oldIndex,
              to: newIndex
            }
          }))
        } else {
          window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_MOVE, {
            detail: {
              from: evt.oldIndex,
              to: evt.newIndex
            }
          }))
        }
      }
    })

    Steps.area.querySelectorAll('.demo-tools-steps-list .demo-tools-step').forEach((el, index) => {
      Steps.addStepEventListeners(el, index)
    })
  }

  static addStepEventListeners(el, index) {
    el.addEventListener('click', (e: MouseEvent) => {
      Steps.handleStepClick(e, index)
    })
    el.addEventListener('dblclick', () => {
      Steps.handleStepDoubleClick(index)
    })
  }
}

export class StepEditForm {
  public area: HTMLElement = null;
  private index: number = null;
  static eventTypes = {
    CHANGE: 'DemoTools:Steps:EditForm:Change',
  };

  constructor(step: Step, index: number) {
    this.index = index;
    const div = document.createElement('div')
    const indexWrapper = document.createElement('div')
    const titleWrapper = document.createElement('div')
    const intervalWrapper = document.createElement('div')
    const listWrapper = document.createElement('div')
    const titleInput = document.createElement('input')
    const intervalInput = document.createElement('input')
    const listCheckbox = document.createElement('input')

    indexWrapper.innerHTML = `<span>${index}</span>`

    titleInput.setAttribute('value', step.title)
    titleInput.setAttribute('type', 'text')
    intervalInput.setAttribute('type', 'number')
    intervalInput.setAttribute('min', '0')
    intervalInput.setAttribute('value', String(step.interval))
    intervalInput.setAttribute('step', '1000')
    intervalInput.setAttribute('size', '3')
    listCheckbox.setAttribute('type', 'checkbox')
    if (step.list) {
      listCheckbox.setAttribute('checked', 'checked')
    }

    titleInput.classList.add('demo-tools-steps-edit-form-title')
    intervalInput.classList.add('demo-tools-steps-edit-form-interval')
    listCheckbox.classList.add('demo-tools-steps-edit-form-list')

    titleInput.addEventListener('blur', this.onTitleBlur.bind(this))
    intervalInput.addEventListener('blur', this.onIntervalBlur.bind(this))
    intervalInput.addEventListener('change', this.onIntervalChange.bind(this))
    listCheckbox.addEventListener('blur', this.onListBlur.bind(this))

    titleWrapper.appendChild(titleInput)
    intervalWrapper.appendChild(intervalInput)
    listWrapper.appendChild(listCheckbox)

    div.classList.add('demo-tools-steps-edit-form')

    div.appendChild(indexWrapper)
    div.appendChild(titleWrapper)
    div.appendChild(intervalWrapper)
    div.appendChild(listWrapper)
    this.area = div;
  }

  onTitleBlur(e: InputEvent) {
    window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: (e.currentTarget as any).value, field: 'title', index: this.index } }))
  }

  onIntervalBlur(e: InputEvent) {
    window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: (e.currentTarget as any).value, field: 'interval', index: this.index } }))
  }

  onIntervalChange(e: InputEvent) {
    window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: (e.currentTarget as any).value, field: 'interval', index: this.index } }))
  }

  onListBlur(e: InputEvent) {
    window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: (e.currentTarget as any).checked, field: 'list', index: this.index } }))
  }

  destroy() {
    const titleInput = this.area.querySelector('.demo-tools-steps-edit-form-title')
    const intervalInput = this.area.querySelector('.demo-tools-steps-edit-form-interval')
    const listCheckbox = this.area.querySelector('.demo-tools-steps-edit-form-list')

    titleInput?.removeEventListener('blur', this.onTitleBlur.bind(this))
    intervalInput?.removeEventListener('blur', this.onIntervalBlur.bind(this))
    intervalInput.removeEventListener('change', this.onIntervalChange.bind(this))
    listCheckbox?.removeEventListener('blur', this.onListBlur.bind(this))

    this.area.remove()
    this.area = null
  }
}