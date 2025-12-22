import { Driver, driver } from 'driver.js'
import { isNil, pick } from 'ramda'

import { IElementBoundStep } from './demo-tools'
import { getElementByXPath } from '../../utils/utils'

export default abstract class CheckStepPrompt {
  static initialized = false;
  static driver: Driver;

  static init() {
    CheckStepPrompt.initialized = true;
    CheckStepPrompt.driver = driver()
  }

  /**
   * @param {IElementBoundStep} arg - A step object
   * @returns {Promise<IElementBoundStep>} A promise that resolves when the form has been submitted
   */
  static async getPrompt(step: IElementBoundStep): Promise<IElementBoundStep | undefined> {
    if (isNil(CheckStepPrompt.driver)) {
      throw new Error('DevTools: CheckStepPrompt is not initialized')
    }

    if (isNil(step)) {
      throw new Error('DevTools: Step not passed')
    }

    const element = getElementByXPath((step as IElementBoundStep).xPath) as HTMLElement

    if (isNil(element)) {
      throw new Error('DevTools: Element not found')
    }

    return await new Promise<IElementBoundStep | undefined>((resolve) => {
      CheckStepPrompt.driver.highlight({
        element,
        popover: {
          description: CheckStepPrompt.getDescription(element),
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Approve',
          prevBtnText: 'Close',
          onNextClick: () => {
            CheckStepPrompt.resolve(resolve, step)
            CheckStepPrompt.driver.destroy()
          },
          onPrevClick: () => {
            resolve(undefined)
            CheckStepPrompt.driver.destroy()
          },
          onCloseClick: () => {
            resolve(undefined)
            CheckStepPrompt.driver.destroy()
          },
        }
      })
    })
  }

  static getDescription(element: HTMLElement) {
    return `${element.localName}.${element.classList.value?.replaceAll(' ', '.')}`
  }

  static resolve(resolve, step: IElementBoundStep) {
    // @ts-ignore
    const element = pick(['classList', 'id', 'localName'], getElementByXPath(step.xPath))
    resolve({ ...step, element })
  }

  static destroy() {
    CheckStepPrompt.initialized = false;
    CheckStepPrompt.driver?.destroy();
    CheckStepPrompt.driver = null;
  }
}