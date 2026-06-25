import Demo, { IOptions as IDemoOptions, options } from 'external/modules/demo-tools/demo'
import { clone, filter, find, findIndex, is, isNil, map, propEq, values } from 'ramda'
import { getVar, reviveVar, setVar, stringifyVar } from 'external/utils/vars-persistence'
import Step from 'external/modules/demo-tools/step'
import { fetchGitSummary, IGitSummary } from 'external/modules/git/git'
import Help from 'external/modules/demo-tools/help/demo-tools-help'
import Steps from 'external/modules/demo-tools/steps/steps'
import MenuBar from 'external/modules/demo-tools/menu-bar/menu-bar'
import DemoStorage from 'external/modules/demo-tools/storage'

export const DEMOS_KEY = 'demos'
export const DEMO_TOOLS_KEY = 'demoToolsOptions'

interface IOptions extends IDemoOptions {
  preloadDemo?: string;
  preloadActiveStep?: string | number;
  store?: boolean;
  autostart?: boolean;
}

let demos: IDemoOptions[] | null = null;

export default abstract class DemoTools {
  static initialized: boolean = false;
  static demo: Demo;
  static gitSummary: IGitSummary | undefined = undefined;
  static storage = DemoStorage

  static async init() {
    if (DemoTools.initialized) {
      return;
    }

    try {
      DemoTools.gitSummary = await fetchGitSummary()
    } catch (e) {
    }

    demos = DemoTools.getDemos()
    DemoTools.initialized = true;
  }

  static async open(arg: IOptions | string = {} as IOptions) {
    if (!DemoTools.initialized) {
      await DemoTools.init();
    }
    if (DemoTools.demo) {
      DemoTools.close();
    }

    if (isNil(getVar(DEMO_TOOLS_KEY))) {
      setVar(DEMO_TOOLS_KEY, {});
    }

    if (isNil(getVar(DEMOS_KEY))) {
      setVar(DEMOS_KEY, []);
    }

    const options = is(String, arg) ? { title: arg } : arg
    const title = options.title || DemoTools.gitSummary?.branch || 'default'
    const existingOptions = demos.find(demo => propEq(title, 'title')(demo)) || {} as IDemoOptions

    window.addEventListener('Demo:OptionsChanged', DemoTools.handleOptionsChanged)
    window.addEventListener('Demo:StepsChanged', DemoTools.handleStepsChanged)
    window.addEventListener('Demo:StepChanged', DemoTools.handleStepChanged)
    window.addEventListener(Steps.eventTypes.STEP_LIST_RENDERED, DemoTools.handleStepListRendered)
    window.addEventListener(MenuBar.eventTypes.EXPORT_DEMO_TO_CONSOLE_CLICK, DemoTools.handleExportDemoToConsoleClick)

    DemoTools.demo = Demo.getInstance({
      ...existingOptions,
      ...options,
      title,
      skipChecks: is(Boolean, options.skipChecks) ? options.skipChecks : Boolean(existingOptions.skipChecks),
    });

    /* expose demo to console */
      (window as any).d = DemoTools.demo;
    /* end */

    const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};

    setVar(DEMO_TOOLS_KEY, { ...demoToolsOptions, store: is(Boolean, options.store) ? options.store : true })

    if (options.preloadDemo) {
      setVar(DEMO_TOOLS_KEY, { ...demoToolsOptions, preloadDemo: options.preloadDemo })

      if (typeof options.autostart !== 'undefined') {
        const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
        setVar(DEMO_TOOLS_KEY, { ...demoToolsOptions, autostart: options.autostart })
      }
    }
  }

  static getDemos(): IDemoOptions[] {
    if (demos) {
      return demos;
    }
    return getVar(DEMOS_KEY) || [];
  }

  static getDemo(title?: string): IDemoOptions | undefined {
    const demos = DemoTools.getDemos();
    // @ts-ignore
    return find<IDemoOptions, IDemoOptions>(propEq(title || DemoTools.demo.options.title, 'title'), values(demos || []))
  }

  static removeDemo(title?: string | number) {
    const demos = DemoTools.getDemos();

    if (is(String, title)) {
      setVar(DEMOS_KEY, filter((demo) => !propEq(title, 'title', demo), demos))
    } else {
      demos.splice(title, 1)
      setVar(DEMOS_KEY, demos)
    }
  }

  static removeDemos() {
    setVar(DEMOS_KEY, [])
  }

  static listDemos() {
    console.table(values(map((demo: IDemoOptions) => ({ title: demo.title, stepsNumber: (values(demo.steps) || []).length }), DemoTools.getDemos())));
  }

  static setDemo(options: IDemoOptions) {
    // @ts-ignore
    const index = findIndex<IDemoOptions>(propEq(options.title,'title'), demos);
    if (index === -1) {
      demos.push(options)
    } else {
      demos[index] = options
    }
    setVar(DEMOS_KEY, demos)

    const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
    if (demoToolsOptions.store) {
      DemoStorage.setDemo(options)
    }
  }

  static async cloneDemo(title1: string, title2?: string) {
    const demo = DemoTools.getDemo(title1)
    if (!demo) {
      return
    }

    if (!!title2) {
      DemoTools.setDemo({ ...demo, title: title2 })
    } else {

      if (!DemoTools.gitSummary) {
        try {
          DemoTools.gitSummary = await fetchGitSummary()
        } catch (e) {}
      }

      const title = DemoTools.gitSummary?.branch || 'default'
      DemoTools.setDemo({ ...demo, title })
    }
  }

  static async importDemo(title: string) {
    const demo = await DemoStorage.getDemo(title);

    if (!is(Object, demo)) {
      return
    }

    const newOptions = { ...demo, title: options.title || demo.title }
    DemoTools.setDemo(newOptions)

    if (DemoTools.demo) {
      DemoTools.refresh(newOptions)
    }
  }

  static exportDemoToConsole(title) {
    const demo = DemoTools.getDemo(title)

    if (!demo) {
      return
    }

    console.log(stringifyVar(demo))
  }

  static handleOptionsChanged() {
    const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
    if (options.mode === 'compose') {
      DemoTools.setDemoToolsOptions({ preloadDemo: options.title })
    } else if (!demoToolsOptions.autostart) {
      DemoTools.setDemoToolsOptions({ preloadDemo: undefined })
    }

    DemoTools.setDemo({ ...options, steps: DemoTools.demo.steps })
  }

  static handleStepsChanged({ detail: { steps } }: CustomEvent<{ steps: (Step)[] }>) {
    DemoTools.setDemo({ ...options, steps })
  }

  static handleStepChanged() {
    DemoTools.setDemo({ ...options, steps: DemoTools.demo.steps })
  }

  static handleStepListRendered() {
    setTimeout(() => {
      const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
      if (demoToolsOptions.autostart === true) {
        if (demoToolsOptions.preloadActiveStep) {
          DemoTools.demo.select(Number(demoToolsOptions.preloadActiveStep) || 0)
        }
        DemoTools.demo.run()
      }
      window.removeEventListener(Steps.eventTypes.STEP_LIST_RENDERED, DemoTools.handleStepListRendered)
    })
  }

  static handleExportDemoToConsoleClick() {
    DemoTools.exportDemoToConsole(DemoTools.demo.title)
  }

  static refresh(optionsChanges: Partial<IDemoOptions> = {}) {
    if (!DemoTools.initialized || !DemoTools.demo) {
      return
    }

    const existingOptions = clone(options)

    DemoTools.close(true)
    DemoTools.open({
      ...existingOptions,
      steps: DemoTools.getDemo(existingOptions.title)?.steps || [],
      ...optionsChanges,
    })
  }

  static setDemoToolsOptions(options: Partial<IOptions>) {
    const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
    setVar(DEMO_TOOLS_KEY, { ...demoToolsOptions, ...options })
  }

  static close(refresh: boolean = false) {
    if (DemoTools.demo) {
      DemoTools.setDemoToolsOptions({ preloadDemo: undefined })
      DemoTools.demo.close();
      DemoTools.demo = null;
      /* remove demo from console */
      (window as any).d = undefined;
      /* end */
    }

    if (refresh) {
      return
    }
    demos = null;
    window.removeEventListener('Demo:OptionsChanged', DemoTools.handleOptionsChanged);
    window.removeEventListener('Demo:StepsChanged', DemoTools.handleStepsChanged);
    window.removeEventListener('Demo:StepChanged', DemoTools.handleStepChanged);
    window.removeEventListener(MenuBar.eventTypes.EXPORT_DEMO_TO_CONSOLE_CLICK, DemoTools.handleExportDemoToConsoleClick);
    DemoTools.initialized = false;
  }

  static help(inConsole: boolean = false) {
    Help.show(inConsole)
  }
}

const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};

if (demoToolsOptions.preloadDemo) {
  DemoTools.open({title: demoToolsOptions.preloadDemo})
}