import Demo, { IOptions as IDemoOptions, IStep, options } from 'external/modules/demo-tools/demo'
import { isNil, mapObjIndexed, values } from 'ramda'
import { getVar, setVar } from 'external/utils/vars-persistence'
import Step from 'external/modules/demo-tools/step'
import { fetchGitSummary, IGitSummary } from 'external/modules/git/git'
import Help from 'external/modules/demo-tools/help/demo-tools-help'

export const DEMOS_KEY = 'demos'

interface IOptions extends IDemoOptions {}

export default abstract class DemoTools {
  static initialized: boolean = false;
  static demo: Demo;

  static async init(options: IOptions = {} as IOptions) {
    if (DemoTools.initialized) {
      return;
    }

    if (isNil(getVar(DEMOS_KEY))) {
      setVar(DEMOS_KEY, {});
    }

    let gitSummary: IGitSummary | undefined = undefined;

    try {
      gitSummary = await fetchGitSummary()
    } catch (e) {}

    const title = options.title || gitSummary?.branch || 'default'

    DemoTools.demo = Demo.getInstance({
      ...options,
      steps: options.steps || DemoTools.getDemos()[title] || [],
      skipChecks: options.skipChecks || false,
    });

    window.addEventListener('Demo:StepsChanged', DemoTools.handleStepsChanged)

    DemoTools.initialized = true;
  }

  static getDemos(): { [title: string]: IStep[] } {
    return getVar(DEMOS_KEY) || {};
  }

  static getDemo(title?: string) {
    const demos = DemoTools.getDemos();
    return values(demos[title || options.title] || [])
  }

  static removeDemo(title?: string) {
    const demos = DemoTools.getDemos();
    delete demos?.[title || options.title];
    setVar(DEMOS_KEY, demos)
  }

  static removeDemos() {
    setVar(DEMOS_KEY, {})
  }

  static listDemos() {
    console.table(values(mapObjIndexed((steps: IStep[], title: string) => ({ title, stepsNumber: (values(steps) || []).length }), DemoTools.getDemos())));
  }

  static setDemo(title: string, steps: IStep[]) {
    const demos = DemoTools.getDemos();
    demos[title] = steps;
    setVar(DEMOS_KEY, demos)
  }

  static handleStepsChanged({ detail: { steps } }: CustomEvent<{ steps: (Step)[] }>) {
    DemoTools.setDemo(options.title, steps)
  }

  static refresh() {
    const existingOptions = { ...options }
    DemoTools.destroy()

    DemoTools.init(existingOptions)
  }

  static destroy() {
    if (DemoTools.demo) {
      DemoTools.demo.close();
      DemoTools.demo = null;
    }
    window.removeEventListener('Demo:StepsChanged', DemoTools.handleStepsChanged);
    DemoTools.initialized = false;
  }

  static help(inConsole: boolean = false) {
    Help.show(inConsole)
  }
}