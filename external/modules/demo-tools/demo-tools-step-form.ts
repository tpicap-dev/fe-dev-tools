import { Driver, driver } from 'driver.js'
import { is, isNil, pick } from 'ramda'

import DemoTools, { IStep, IElementBoundStep, IHighlightingStep } from './demo-tools'
import './style.less'
import { getElementByXPath } from '../../utils/utils'

export default abstract class StepForm {
  static driver: Driver;

  static init() {
    StepForm.driver = driver()
  }

  static getFormValues() {
    return {
      title: (document.getElementById('demo-tools-step-picker-form-title') as HTMLInputElement).value,
      type: (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value as IStep['type'],
      shiftX: +(document.getElementById('demo-tools-step-picker-form-shiftX') as HTMLInputElement).value,
      shiftY: +(document.getElementById('demo-tools-step-picker-form-shiftY') as HTMLInputElement).value,
      shiftWidth: +(document.getElementById('demo-tools-step-picker-form-shiftWidth') as HTMLInputElement).value,
      shiftHeight: +(document.getElementById('demo-tools-step-picker-form-shiftHeight') as HTMLInputElement).value,
      interval: +(document.getElementById('demo-tools-step-picker-form-interval') as HTMLInputElement).value,
      list: (document.getElementById('demo-tools-step-picker-form-list') as HTMLInputElement).checked,
      xPath: (document.getElementById('demo-tools-step-picker-form-xPath') as HTMLInputElement).value,
    } as IElementBoundStep;
  }

  static setFormValues(values: Partial<IElementBoundStep>) {
    Object.entries(values).forEach(([key, value]) => {
      (document.getElementById(`demo-tools-step-picker-form-${key}`) as HTMLInputElement).value = value
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

    let xPath
    let formValues

    if (isNil(arg)) {
      throw new Error('DevTools: Step not passed')
    }

    if (is(String, arg)) {
      xPath = arg
      formValues = { xPath }
    } else {
      xPath = (arg as IElementBoundStep).xPath
      formValues = arg
    }

    return await new Promise<IElementBoundStep | undefined>((resolve) => {
      StepForm.driver.highlight({
        element: getElementByXPath(xPath) as HTMLElement,
        popover: {
          description: StepForm.getForm(formValues),
          showButtons: ['next', 'close'],
          nextBtnText: 'Done',
          onPopoverRender: (popoverDom) => {
            const handleKeydown = (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                StepForm.resolveForm(resolve)
                StepForm.driver.destroy()
              }
            }
            popoverDom.wrapper?.removeEventListener('keydown', handleKeydown)
            popoverDom.wrapper?.addEventListener('keydown', handleKeydown)
          },
          onNextClick: () => {
            StepForm.resolveForm(resolve)
            StepForm.driver.destroy()
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
    const values = StepForm.getFormValues()
    // @ts-ignore
    const element = pick(['classList', 'id', 'localName'], getElementByXPath(values.xPath))
    resolve({ ...values, element })
  }

  static getForm(values?: Partial<IElementBoundStep>): string {
    const element = values?.element || getElementByXPath(values?.xPath || '')
    const xPathSegments = (values.xPath || '').split('/').filter(Boolean)
    return `
      <div class="demo-tools" id="demo-tools-step-picker-form">
        <div class="demo-tools-step-picker-form-label">Title:</div>
        <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-title" autofocus value="${values?.title || ''}" /></div>
        <div class="demo-tools-step-picker-form-label">Interval:</div>
        <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-interval" value="${values?.interval || DemoTools.defaultInterval}" step="100" />&nbsp;ms</div>
        <div class="demo-tools-step-picker-form-label">Listed:</div>
        <div class="demo-tools-step-picker-form-control"><input type="checkbox" id="demo-tools-step-picker-form-list" checked="${is(Boolean, values?.list)? values.list.toString() : 'true'}" /></div>
        <div class="demo-tools-step-picker-form-label">Type:</div>
        <div class="demo-tools-step-picker-form-control">
          <select id="demo-tools-step-picker-form-type" onchange="window.demo.stepForm.onStepTypeChange()">
            <option value="highlight" ${values?.type === 'highlight' || isNil(values?.type) ? 'selected' : ''}>Highlight</option>
            <option value="click" ${values?.type === 'click' ? 'selected' : ''}>Click</option>
            <option value="rightclick" ${values?.type === 'rightclick' ? 'selected' : ''}>Right Click</option>
            <option value="hover" ${values?.type === 'hover' ? 'selected' : ''}>Hover</option>
          </select>
        </div>
        <div class="demo-tools-step-picker-form-label">Ascend:</div>
        <div class="demo-tools-step-picker-form-control" style="align-items: flex-start;display: flex;gap: 5px;">
          <select id="demo-tools-step-picker-form-xPath" style="width: 50px;" onchange="window.demo.stepForm.onXpathChange()">
            ${
              xPathSegments.map((_, index) => {
                return `<option value="/${xPathSegments.slice(0, xPathSegments.length - index).join('/')}">${index}</option>`
              })
            }
          </select>
          <span title="${element.localName}.${element.classList.value?.replaceAll(' ', '.')}" style="color: blue; font-size: 1.2em; line-height: 1em; cursor: pointer;">&#9432;</span>
          </div>
        <div id="demo-tools-step-picker-form-highlight-fields" style="gap: 5px; grid-column: 1/3; display: ${values?.type === 'highlight'|| isNil(values?.type) ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Shift X:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftX" step="10" value="${(values as IHighlightingStep)?.shiftX}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Y:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftY" step="10" value="${(values as IHighlightingStep)?.shiftY}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Width:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftWidth" step="10" value="${(values as IHighlightingStep)?.shiftWidth}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Height:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftHeight" step="10" value="${(values as IHighlightingStep)?.shiftHeight}" /></div>
        </div>
      </div>
    `
  }

  static onStepTypeChange() {
    document.getElementById('demo-tools-step-picker-form-highlight-fields').style.display = (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'highlight' ? 'grid' : 'none'
  }

  static onXpathChange() {
    const driver = (window as any).demo?.stepForm.driver
    const formValues = (window as any).demo.stepForm.getFormValues()
    const xPath = (document.getElementById('demo-tools-step-picker-form-xPath') as HTMLInputElement).value
    const element = getElementByXPath(xPath)
    driver.getActiveStep().element = element
    driver.highlight(driver.getActiveStep())
    setTimeout(() => {
      (window as any).demo?.stepForm.setFormValues(formValues)
      const infoIcon = ((document.getElementById('demo-tools-step-picker-form-xPath') as HTMLInputElement).nextElementSibling as HTMLElement)
      if (infoIcon) {
        infoIcon.title = element.localName + '.' + element.classList.value?.replace(/ +/g, '.')
      }
    }, 1000)
  }

  static destroy() {
    StepForm.driver?.destroy();
    StepForm.driver = null;
  }
}
