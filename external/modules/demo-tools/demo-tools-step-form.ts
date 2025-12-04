import { is, isEmpty, isNil } from 'ramda'
import { Driver, driver } from 'driver.js'

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
    } as IStep;
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
                resolve({
                  ...StepForm.getFormValues(),
                  xPath,
                })
                StepForm.driver.destroy()
              }
            }
            popoverDom.wrapper?.removeEventListener('keydown', handleKeydown)
            popoverDom.wrapper?.addEventListener('keydown', handleKeydown)
          },
          onNextClick: () => {
            resolve({
              ...StepForm.getFormValues(),
              xPath,
            })
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

  static getForm(values?: Partial<IStep>): string {
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
          <select id="demo-tools-step-picker-form-type" onchange="window.devTools?.demoToolsStepPicker.onStepTypeChange()">
            <option value="highlight" ${values?.type === 'highlight' || isNil(values?.type) ? 'selected' : ''}>Highlight</option>
            <option value="click" ${values?.type === 'click' ? 'selected' : ''}>Click</option>
            <option value="rightclick" ${values?.type === 'rightclick' ? 'selected' : ''}>Right Click</option>
            <option value="hover" ${values?.type === 'hover' ? 'selected' : ''}>Hover</option>
          </select>
        </div>
        <div id="demo-tools-step-picker-form-highlight-fields" style="grid-column: 1/3; display: ${values?.type === 'highlight'|| isNil(values?.type) ? 'grid' : 'none'};">
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
}

setTimeout(() => {
  (window as any).devTools.demoToolsStepPicker = {};
  (window as any).devTools.demoToolsStepPicker.onStepTypeChange = () => {
    document.getElementById('demo-tools-step-picker-form-highlight-fields').style.display = (document.getElementById('demo-tools-step-picker-form-type') as HTMLInputElement).value === 'highlight' ? 'grid' : 'none'
  }
})
