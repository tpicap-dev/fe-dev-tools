import { IOptions } from 'external/modules/demo-tools/demo'
import Step, { IGetReduxActionStepParams } from 'external/modules/demo-tools/step'
import { reviveVar, stringifyVar } from 'external/utils/vars-persistence'
import { DEMOS_KEY } from 'external/modules/demo-tools/demo-tools'
import Storage from 'modules/storage/external/storage'

export const STEPS_KEY = 'steps'

interface ISetStepParams {
}

interface ISetReduxActionStepParams extends ISetStepParams, IGetReduxActionStepParams {}

interface ISetRestoringAppStateStepParams extends ISetStepParams {
  title?: string;
}

export default class DemoStorage {
  static async setDemo(options: IOptions) {
    return Storage.set(`${DEMOS_KEY}.${options.title}`, stringifyVar(options))
  }

  static async getDemo(title: string): Promise<IOptions> {
    const demoStr = await Storage.get(`${DEMOS_KEY}.${title}`);
    return reviveVar(demoStr)
  }

  static async setStep(step: Step) {
    return Storage.set(`${STEPS_KEY}.${step.title}`, stringifyVar(step))
  }

  static async getStep(title: string): Promise<Step> {
    const stepStr = await Storage.get(`${STEPS_KEY}.${title}`)

    return reviveVar(stepStr)
  }

  static async setReduxActionStep(params: ISetReduxActionStepParams) {
    return DemoStorage.setStep(Step.getReduxActionStep(params))
  }

  static async setRestoringAppStateStep(params: ISetRestoringAppStateStepParams) {
    const step = Step.getRestoringAppStateStep()

    if (params.title) {
      step.title = params.title
    }
    return DemoStorage.setStep(step as Step)
  }
}