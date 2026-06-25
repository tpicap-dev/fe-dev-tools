import { Driver, driver } from 'driver.js'
import { clone, filter, is, isEmpty, isNil, pick, pipe, values } from 'ramda'

import Demo, { IStep, IElementBoundStep, IElementBoundStepBase, IHighlightingStep, IInputBoundStep } from './demo'
import dom from 'external/modules/demo-tools/dom/dom'
import './style.less'
import { getElementByXPath } from '../../utils/utils'

interface IFormValues extends IElementBoundStepBase {
  useSelector: boolean;
  selectorLvl0: string;
  selectorLvl0Checked: boolean;
  selectorLvl1: string;
  selectorLvl1Checked: boolean;
  selectorLvl2: string;
  selectorLvl2Checked: boolean;
  selectorLvl3: string;
  selectorLvl3Checked: boolean;
}

export default abstract class StepForm {
  static driver: Driver;

  static init() {
    StepForm.driver = driver({
      popoverClass: 'demo-tools-driver-popover',
    })
  }

  static getFormValues() {
    return {
      title: (document.getElementById('demo-tools-step-picker-form-title') as HTMLInputElement).value,
      type: (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value as IStep['type'],
      description: (document.getElementById('demo-tools-step-picker-form-description') as HTMLInputElement).value,
      shiftX: +(document.getElementById('demo-tools-step-picker-form-shiftX') as HTMLInputElement).value,
      shiftY: +(document.getElementById('demo-tools-step-picker-form-shiftY') as HTMLInputElement).value,
      shiftWidth: +(document.getElementById('demo-tools-step-picker-form-shiftWidth') as HTMLInputElement).value,
      shiftHeight: +(document.getElementById('demo-tools-step-picker-form-shiftHeight') as HTMLInputElement).value,
      interval: +(document.getElementById('demo-tools-step-picker-form-interval') as HTMLInputElement).value,
      list: (document.getElementById('demo-tools-step-picker-form-list') as HTMLInputElement).checked,
      xPath: StepForm.getSelectorValue() ? null : (document.getElementById('demo-tools-step-picker-form-xPath') as HTMLInputElement).value,
      value: (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'setValue' ?
        (document.getElementById('demo-tools-step-picker-form-value') as HTMLInputElement).value :
        undefined,
      keyboardKey: (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'keyboard' ?
        (document.getElementById('demo-tools-step-picker-form-keyboardKey') as HTMLInputElement).value :
        undefined,
      selector: StepForm.getSelectorValue(),
      scrollAxe: (document.getElementById('demo-tools-step-picker-form-scrollAxe') as HTMLInputElement).value,
      scrollBy: (document.getElementById('demo-tools-step-picker-form-scrollBy') as HTMLInputElement).value,
    } as unknown as IFormValues;
  }

  static setFormValues(values: Partial<IElementBoundStep>) {
    Object.entries(values).forEach(([key, value]) => {
      const formElement = document.getElementById(`demo-tools-step-picker-form-${key}`) as HTMLInputElement

      if(formElement) {
        formElement.value = String(value)
      }
    })
  }

  /**
   * @param {IStep | string} arg - A step object or element xpath
   * @returns {Promise<IStep>} A promise that resolves when the form has been submitted
   */
  static async getPrompt(arg: IElementBoundStep | string): Promise<IElementBoundStep | undefined> {
    if (isNil(StepForm.driver)) {
      throw new Error('DevTools: StepPicker is not initialized')
    }

    let formValues = {} as any
    let element = {} as any

    if (isNil(arg)) {
      throw new Error('DevTools: Step not passed')
    }

    if (is(String, arg)) {
      element = getElementByXPath(arg) as HTMLElement
      formValues = { xPath: arg }
    } else if ((arg as IElementBoundStep).selector) {
      element = document.querySelector((arg as IElementBoundStep).selector)
      formValues = arg
    } else if ((arg as IElementBoundStep).xPath) {
      element = getElementByXPath((arg as IElementBoundStep).xPath) as HTMLElement
      formValues = arg
    }


    return await new Promise<IElementBoundStep | undefined>((resolve) => {
      StepForm.driver.highlight({
        element,
        popover: {
          popoverClass: 'demo-tools-driver-popover',
          description: StepForm.getForm(formValues),
          showButtons: ['next', 'close'],
          nextBtnText: 'Done',
          onPopoverRender: (popoverDom) => {
            const handleKeydown = (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                if (StepForm.resolveForm(resolve)) {
                  StepForm.driver.destroy()
                }
              }
            }

            setTimeout(() => popoverDom.wrapper.querySelector('input')?.focus(), 100)
            popoverDom.wrapper?.removeEventListener('keydown', handleKeydown)
            popoverDom.wrapper?.addEventListener('keydown', handleKeydown)
          },
          onNextClick: () => {
            if (StepForm.resolveForm(resolve)) {
              StepForm.driver.destroy()
            }
          },
          onCloseClick: () => {
            resolve(undefined)
            StepForm.driver.destroy()
          },
        },
      })
    })
  }

  static resolveForm(resolve) {
    const formValues = StepForm.getFormValues()
    const element = formValues.xPath ? getElementByXPath(formValues.xPath) : document.querySelector(formValues.selector)
    const resElement = {
      classList: pipe(values, filter(cl => cl !== 'driver-active-element'))(element?.classList || []),
      id: element?.id,
      localName: element?.localName,
    }

    if ((isEmpty(resElement.classList) || isNil(resElement.classList)) && (isEmpty(resElement.id) || isNil(resElement.id))) {
      if (!confirm('Element class list and id are missing')) {
        return false
      }
    }
    resolve({ ...formValues, element: resElement })
    return true
  }

  static getForm(values?: Partial<IFormValues>): string {
    let element
    if(values?.element) {
      element = values?.element
    } else if (values?.selector) {
      element = document.querySelector(values?.selector)
    } else if (values?.xPath) {
      element = getElementByXPath(values?.xPath) as HTMLElement
    } else {
      throw new Error('DevTools: Step element is missing')
    }

    if (!element) {
      throw new Error('DevTools: Step element is missing')
    }
    const xPathSegments = (values.xPath || '').split('/').filter(Boolean)
    return `
      <div class="demo-tools" id="demo-tools-step-picker-form">
        <div class="demo-tools-step-picker-form-label">Title:</div>
        <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-title" autofocus value="${values?.title || ''}" /></div>
        <div class="demo-tools-step-picker-form-label">Interval:</div>
        <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-interval" value="${values?.interval || Demo.defaultInterval}" step="100" />&nbsp;ms</div>
        <div class="demo-tools-step-picker-form-label">Listed:</div>
        <div class="demo-tools-step-picker-form-control"><input type="checkbox" id="demo-tools-step-picker-form-list" checked="${is(Boolean, values?.list)? values.list.toString() : 'true'}" /></div>
        <div class="demo-tools-step-picker-form-label">Type:</div>
        <div class="demo-tools-step-picker-form-control">
          <select id="demo-tools-step-picker-form-type" onchange="window.demoTools.demo.stepForm.onStepTypeChange()">
            <option value="highlight" ${values?.type === 'highlight' || isNil(values?.type) ? 'selected' : ''}>Highlight</option>
            <option value="click" ${values?.type === 'click' ? 'selected' : ''}>Click</option>
            <option value="rightclick" ${values?.type === 'rightclick' ? 'selected' : ''}>Right Click</option>
            <option value="hover" ${values?.type === 'hover' ? 'selected' : ''}>Hover</option>
            <option value="setValue" ${values?.type === 'setValue' ? 'selected' : ''}>Set Value</option>
            <option value="keyboard" ${values?.type === 'keyboard' ? 'selected' : ''}>Keyboard</option>
            <option value="scroll" ${values?.type === 'scroll' ? 'selected' : ''}>Scroll</option>
          </select>
        </div>
        <div class="demo-tools-step-picker-form-label">Ascend:</div>
        <div class="demo-tools-step-picker-form-control" style="align-items: flex-start;display: flex;gap: 5px;">
          <select id="demo-tools-step-picker-form-xPath" style="width: 50px;" onchange="window.demoTools.demo.stepForm.onXpathChange()">
            ${
              xPathSegments.map((_, index) => {
                return `<option value="/${xPathSegments.slice(0, xPathSegments.length - index).join('/')}">${index}</option>`
              })
            }
          </select>
          <span title="${element.localName}.${[...element.classList].join('.')}" style="color: blue; font-size: 1.2em; line-height: 1em; cursor: pointer;">&#9432;</span>
        </div>
        <div class="demo-tools-step-picker-form-label">Selector:</div>
        <div class="demo-tools-step-picker-form-control">
            <input type="checkbox" id="demo-tools-step-picker-form-useSelector" onclick="window.demoTools.demo.stepForm.onUseSelectorClick()" ${values?.selector ? 'checked' : ''} />
        </div>
        <div id="demo-tools-step-picker-form-highlight-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${values?.type === 'highlight'|| isNil(values?.type) ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Description:</div>
          <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-description" value="${(values as IHighlightingStep)?.description || ''}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift X:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftX" step="10" value="${(values as IHighlightingStep)?.shiftX}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Y:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftY" step="10" value="${(values as IHighlightingStep)?.shiftY}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Width:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftWidth" step="10" value="${(values as IHighlightingStep)?.shiftWidth}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Height:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftHeight" step="10" value="${(values as IHighlightingStep)?.shiftHeight}" /></div>
        </div>
        <div id="demo-tools-step-picker-form-setValue-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${values?.type === 'setValue' ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Value:</div>
          <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-value" value="${(values as IInputBoundStep)?.value || ''}" /></div>
        </div>
        <div id="demo-tools-step-picker-form-keyboard-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${values?.type === 'keyboard' ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Keyboard Key:</div>
          <div class="demo-tools-step-picker-form-control">
            <select id="demo-tools-step-picker-form-keyboardKey" value="${values?.keyboardKey || 'Enter'}">
                <option value="Enter">Enter</option>
                <option value="Escape">Escape</option>
                <option value="Tab">Tab</option>
                <option value="Delete">Delete</option>
                <option value="Backspace">Backspace</option>
                <option value="ArrowUp">Arrow Up</option>
                <option value="ArrowDown">Arrow Down</option>
                <option value="ArrowLeft">Arrow Left</option>
                <option value="ArrowRight">Arrow Right</option>
            </select>
          </div>
        </div>
        <div id="demo-tools-step-picker-form-scroll-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${values?.type === 'keyboard' ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Axe:</div>
          <div class="demo-tools-step-picker-form-control">
            <select id="demo-tools-step-picker-form-scrollAxe" value="${values?.scrollAxe || 'y'}">
                <option value="y">Y</option>
                <option value="x">X</option>
            </select>
          </div>
          <div class="demo-tools-step-picker-form-label">Scroll by:</div>
          <div class="demo-tools-step-picker-form-control">
            <input id="demo-tools-step-picker-form-scrollBy" value="${values?.scrollBy || 100}" type="number" />&nbsp;px
          </div>
        </div>
        <div id="demo-tools-step-picker-form-selector-fields" style="gap: 5px; grid-column: 1 / 3; flex-direction: column; display: ${values?.useSelector || values?.selector ? 'flex' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Element selector</div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl0" value="${values?.selector || StepForm.getSelectorLvlValue(element, 0)}" title="${values?.selector || StepForm.getSelectorLvlValue(element, 0)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl0Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl1" value="${StepForm.getSelectorLvlValue(element, 1)}" title="${StepForm.getSelectorLvlValue(element, 1)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl1Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl2" value="${StepForm.getSelectorLvlValue(element, 2)}" title="${StepForm.getSelectorLvlValue(element, 2)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl2Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl3" value="${StepForm.getSelectorLvlValue(element, 3)}" title="${StepForm.getSelectorLvlValue(element, 3)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl3Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl4" value="${StepForm.getSelectorLvlValue(element, 4)}" title="${StepForm.getSelectorLvlValue(element, 4)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl4Checked" checked="true" />
          </div>
        </div>
      </div>
    `
  }

  static getSelectorValue() {
    const values = {
      useSelector: (document.getElementById('demo-tools-step-picker-form-useSelector') as HTMLInputElement).checked,
      selectorLvl0: (document.getElementById('demo-tools-step-picker-form-selectorLvl0') as HTMLInputElement).value,
      selectorLvl0Checked: (document.getElementById('demo-tools-step-picker-form-selectorLvl0Checked') as HTMLInputElement).checked,
      selectorLvl1: (document.getElementById('demo-tools-step-picker-form-selectorLvl1') as HTMLInputElement).value,
      selectorLvl1Checked: (document.getElementById('demo-tools-step-picker-form-selectorLvl1Checked') as HTMLInputElement).checked,
      selectorLvl2: (document.getElementById('demo-tools-step-picker-form-selectorLvl2') as HTMLInputElement).value,
      selectorLvl2Checked: (document.getElementById('demo-tools-step-picker-form-selectorLvl2Checked') as HTMLInputElement).checked,
      selectorLvl3: (document.getElementById('demo-tools-step-picker-form-selectorLvl3') as HTMLInputElement).value,
      selectorLvl3Checked: (document.getElementById('demo-tools-step-picker-form-selectorLvl3Checked') as HTMLInputElement).checked,
      selectorLvl4: (document.getElementById('demo-tools-step-picker-form-selectorLvl4') as HTMLInputElement).value,
      selectorLvl4Checked: (document.getElementById('demo-tools-step-picker-form-selectorLvl4Checked') as HTMLInputElement).checked,
    }
    if (!values.useSelector) {
      return
    } else {
      const selectors = []
      if (values.selectorLvl4 && values.selectorLvl4Checked) {
        selectors.push(values.selectorLvl4)
      }
      if (values.selectorLvl3 && values.selectorLvl3Checked) {
        selectors.push(values.selectorLvl3)
      }
      if (values.selectorLvl2 && values.selectorLvl2Checked) {
        selectors.push(values.selectorLvl2)
      }
      if (values.selectorLvl1 && values.selectorLvl1Checked) {
        selectors.push(values.selectorLvl1)
      }
      if (values.selectorLvl0 && values.selectorLvl0Checked) {
        selectors.push(values.selectorLvl0)
      }
      return selectors.join(' ')
    }
  }

  static getSelectorLvlValue(element: HTMLElement, lvl: number) {
    const parentElement = dom.getNthParent(element, lvl)
    if (!parentElement) {
      return ''
    }
    const selectors = [parentElement.localName]
    if (parentElement.id) {
      selectors.push(`#${parentElement.id}`)
    }
    if (parentElement.classList.length) {
      selectors.push(`.${[...parentElement.classList].join('.')}`)
    }
    return selectors.join('')
  }

  static onStepTypeChange() {
    document.getElementById('demo-tools-step-picker-form-highlight-fields').style.display = (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'highlight' ? 'grid' : 'none'
    document.getElementById('demo-tools-step-picker-form-setValue-fields').style.display = (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'setValue' ? 'grid' : 'none'
    document.getElementById('demo-tools-step-picker-form-keyboard-fields').style.display = (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'keyboard' ? 'grid' : 'none'
    document.getElementById('demo-tools-step-picker-form-scroll-fields').style.display = (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'scroll' ? 'grid' : 'none'
  }

  static onXpathChange() {
    const driver = (window as any).demoTools.demo?.stepForm.driver
    const formValues = (window as any).demoTools.demo.stepForm.getFormValues()
    const xPath = (document.getElementById('demo-tools-step-picker-form-xPath') as HTMLInputElement).value
    const element = getElementByXPath(xPath)
    driver.getActiveStep().element = element
    driver.highlight({
      ...driver.getActiveStep(),
      popover: {
        ...driver.getActiveStep().popover,
        description: StepForm.getForm(formValues),
      },
    })
    driver.refresh()
    setTimeout(() => {
      const infoIcon = ((document.getElementById('demo-tools-step-picker-form-xPath') as HTMLInputElement).nextElementSibling as HTMLElement)
      if (infoIcon) {
        infoIcon.title = element.localName + (element.classList.value ? '.' + element.classList.value?.replace(/ +/g, '.') : '')
      }
    }, 1000)
  }

  static onUseSelectorClick() {
    document.getElementById('demo-tools-step-picker-form-selector-fields').style.display = (document.getElementById('demo-tools-step-picker-form-useSelector') as HTMLInputElement).checked ? 'flex' : 'none'
  }

  static destroy() {
    StepForm.driver?.destroy();
    StepForm.driver = null;
  }
}
