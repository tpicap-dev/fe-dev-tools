import Demo, { ICustomStep, IElementBoundStep, IHighlightingStep, IInputBoundStep, IStep, IStepBase } from './demo'
import {
  clone,
  equals,
  find, forEach,
  forEachObjIndexed,
  intersection,
  is, isEmpty,
  isNil,
  mapObjIndexed, modifyPath,
  pipe,
  propEq,
  values
} from 'ramda'
import { getElementByXPath } from 'external/utils/utils'
import { IGetActionsParams } from 'external/modules/redux/actions-cache'
import { findProp } from 'external/modules/ladash/ladash'
import constants from '../../../shared/constants.json'
import StepForm from 'external/modules/demo-tools/demo-tools-step-form'
import Dom from 'external/modules/demo-tools/dom/dom'

export interface IGetReduxActionStepParams extends IGetActionsParams, Partial<IStepBase> {
  list?: boolean;
  title?: string;
  actions?: any[];
}

export default class Step implements IStepBase {
  title: IStepBase['title'];
  description: IStepBase['description'] | undefined;
  interval: IStepBase['interval'];
  type: IStepBase['type'];
  list: IStepBase['list'];
  selector: string;
  func: ICustomStep['func'];
  element: Pick<HTMLElement, 'classList' | 'id' | 'localName'> | undefined;
  xPath: string;
  area: IHighlightingStep['area'];
  shiftX: IHighlightingStep['shiftX'];
  shiftY: IHighlightingStep['shiftY'];
  shiftWidth: IHighlightingStep['shiftWidth'];
  shiftHeight: IHighlightingStep['shiftHeight'];
  customData: IStepBase['customData'];
  xPathCheck: IElementBoundStep['xPathCheck'];
  coordCheck: IElementBoundStep['coordCheck'];
  value: IInputBoundStep['value'];
  keyboardKey: IElementBoundStep['keyboardKey'];
  areaStyle: any;
  elementX: IElementBoundStep['elementX'];
  elementY: IElementBoundStep['elementY'];
  scrollAxe?: IElementBoundStep['scrollAxe'];
  scrollBy?: IElementBoundStep['scrollBy'];
  labels?: IStepBase['labels'];

  constructor(step : Partial<IStep>) {
    this.title = String(step.title);
    this.description = step?.description ? String(step.description) : '';
    this.interval = step.type === 'section' ? 0 : Number(step?.interval) || Demo.defaultInterval;
    this.type = String(step.type || 'custom') as IStepBase['type'];
    this.list = Boolean(step.list);
    this.selector = (step as any).selector ? String((step as any).selector) : undefined;
    this.func = step.type === 'custom' && typeof (step as ICustomStep).func === 'function' ? (step as ICustomStep).func : undefined;
    this.element = (step as IElementBoundStep)?.element ? {
      classList: Object.values((step as IElementBoundStep)?.element?.classList) as unknown as DOMTokenList,
      id: String((step as IElementBoundStep)?.element?.id || ''),
      localName: String((step as IElementBoundStep)?.element?.localName || '')
    } : undefined;
    this.xPath = (step as IElementBoundStep).xPath ? String((step as IElementBoundStep).xPath) : undefined;
    this.area = (step as IHighlightingStep).area ? {
      left: Number((step as IHighlightingStep).area.left || 0),
      top: Number((step as IHighlightingStep).area.top || 0),
      width: Number((step as IHighlightingStep).area.width || 0),
      height: Number((step as IHighlightingStep).area.height || 0),
    } : undefined;
    this.shiftX = Number((step as IHighlightingStep).shiftX || 0);
    this.shiftY = Number((step as IHighlightingStep).shiftY || 0);
    this.shiftWidth = Number((step as IHighlightingStep).shiftWidth || 0);
    this.shiftHeight = Number((step as IHighlightingStep).shiftHeight || 0);
    this.customData = step.customData ? step.customData : undefined;
    this.xPathCheck = typeof (step as IElementBoundStep).xPathCheck === 'boolean' ? (step as IElementBoundStep).xPathCheck : 'ignored';
    this.coordCheck = typeof (step as IElementBoundStep).coordCheck === 'boolean' ? (step as IElementBoundStep).coordCheck : 'ignored';
    this.value = !isEmpty((step as IInputBoundStep).value) && !isNil((step as IInputBoundStep).value) ?
      isNaN((step as IInputBoundStep).value as any) ? String((step as IInputBoundStep).value) : Number((step as IInputBoundStep).value)
      : undefined;
    this.keyboardKey = (step as IElementBoundStep).keyboardKey ? String((step as IElementBoundStep).keyboardKey) as IElementBoundStep['keyboardKey']  : undefined;
    this.areaStyle = (step as IHighlightingStep).areaStyle ? {
      backgroundColor: String((step as IHighlightingStep).areaStyle.backgroundColor || 'revert'),
      zIndex: Number((step as IHighlightingStep).areaStyle.zIndex) || 'revert',
      opacity: Number((step as IHighlightingStep).areaStyle.opacity || 1),
    } : undefined;
    this.elementX = Number((step as IElementBoundStep).elementX) || null;
    this.elementY = Number((step as IElementBoundStep).elementY) || null;
    this.scrollAxe = (step as IElementBoundStep).scrollAxe ? String((step as IElementBoundStep).scrollAxe) as IElementBoundStep['scrollAxe'] : undefined;
    this.scrollBy = (step as IElementBoundStep).scrollBy ? Number((step as IElementBoundStep).scrollBy) : undefined;
    this.labels = (step as IStepBase).labels ? (step as IStepBase).labels : undefined;
  }

  get isFilled() {
    if (this.type === 'section' || this.type === 'stop' || this.type === 'wait') {
      return !!this.title
    }
    return Boolean((this.element || this.xPath || this.selector || this.func || this.area) && this.title && !isNil(this.interval));
  }

  get xPathError(): string | null {
    if (!(this as unknown as IElementBoundStep).xPath) {
      return null
    }

    if (!this.element) {
      return null
    }

    const el = getElementByXPath((this as unknown as IElementBoundStep).xPath)

    const match = Dom.attrsMatch(el, this.element as HTMLElement)

    if (match === true) {
      return null
    } else {
      return match
    }
  }

  get hasCorrectXPath(): boolean {
    return this.xPathError === null
  }

  get hasCorrectCoordinates(): boolean {
    if ((this.elementX === null || this.elementY === null)) {
      return true
    }

    const element = document.elementFromPoint(this.elementX, this.elementY)

    return Dom.attrsMatch(element as HTMLElement, this.element as HTMLElement) === true
  }

  get hasCorrectSelector(): boolean {
    if (!this.selector) {
      return true
    }

    const element = document.querySelector(this.selector)
    if (!element) {
      return false
    }

    if (!this.element) {
      return true
    }

    return Dom.attrsMatch(element as HTMLElement, this.element as HTMLElement) === true
  }

  get isVisible(): boolean {
    return Dom.isElementInViewport(this)
  }

  get isElementBound() {
    return !isNil(this.selector) || !isNil(this.xPath) || !isNil((this as IHighlightingStep).area)
  }

  get elementBoundCheck() {
      return !this.isElementBound ||
          this.isVisible && (
            (this.xPath && this.hasCorrectXPath) ||
            (this.elementX && this.elementY && this.hasCorrectCoordinates) ||
            (this.selector && this.hasCorrectSelector)
          )
  }

  get f() {
    return this.func.toString()
  }

  static async pickStep(step: Step = null): Promise<IStep | null> {
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

    let newStep

    if (step !== null) {
      newStep = await StepForm.getPrompt({
        title: step.title,
        xPath
      } as IElementBoundStep)
    } else {
      newStep = await StepForm.getPrompt(xPath)
    }

    if (!newStep) {
      return null
    }

    const element = getElementByXPath(newStep.xPath)
    if (Dom.attrsMatch(element, newStep.element) === true) {
      const rect = element.getBoundingClientRect()

      newStep.elementX = rect.left + window.scrollX
      newStep.elementY = rect.top + window.scrollY
    }

    return new Step(newStep)
  }

  static getReduxActionStep(params: IGetReduxActionStepParams) {
    if (isNil((window as any)?.store)) {
      throw new Error('DemoTools: Redux store is not initialized')
    }

    return new Step({
      type: 'custom',
      title: params.title || 'Action Step',
      list: params.list === false ? false : true,
      customData: params?.actions ? params?.actions : (window as any).store.getActions(params),
      func: () => {
        const activeStep = (window as any).demoTools.demo.steps[(window as any).demoTools.demo.state.activeStep]

        if (isNil(activeStep.customData) || !is(Array, activeStep.customData)) {
          return
        }

        values(activeStep.customData).forEach((action: any) => {
          (window as any).store.dispatch(action)
        })
      }
    })
  }

  static getRestoringAppStateStep() {
    if (isNil((window as any)?.store)) {
      throw new Error('DemoTools: Redux store is not initialized')
    }

    const appState = clone((window as any).store?.getAppState())

    if (!appState) {
      return
    }

    appState.panels = pipe(
      mapObjIndexed((panel: any, panelId) => ({ ...panel, panelId })),
      values,
    )(appState.panels)

    return new Step(
      {
        type: 'custom',
        title: 'Restoring Panel State',
        list: false,
        customData: appState,
        func: () => {
          const activeStep = (window as any).demoTools.demo.steps[(window as any).demoTools.demo.state.activeStep];
          const existingAppState = (window as any).store?.getState()?.[constants.APP_ID] || [];
          if (!existingAppState) {
            return
          }
          const storedAppState = activeStep.customData
          if (!storedAppState) {
            return
          }
          let newAppState = {
            ...clone(storedAppState),
            panels: {}
          }
          const panelIdsMap = {}
          forEachObjIndexed((panelState, panelId) => {
            const storedPanelState: any = find(propEq(panelState.panelType, 'panelType'), storedAppState?.panels || [])
            if (storedPanelState) {
              panelIdsMap[storedPanelState.panelId] = panelId
            }
          }, existingAppState.panels || {})

          forEachObjIndexed((existingPanelId, storedPanelId) => {
            const props = findProp(newAppState, storedPanelId)

            forEach(({ key, path }) => {
              newAppState = { ...newAppState, ...modifyPath(path.slice(0, path.length - 1), (value = {}) => ({ ...value, [existingPanelId]: value?.[storedPanelId] }), newAppState) }
            }, props || [])
          }, panelIdsMap)

          forEach((panel: any) => {
            newAppState.panels[panelIdsMap[panel.panelId]] = panel
          }, storedAppState.panels)

          Object.keys(existingAppState).forEach((reducerName) => {
            if (newAppState[reducerName]) {
              (window as any).store.setField(`${constants.APP_ID}.${reducerName}`, newAppState[reducerName]);
            }
          });
        }
      }
    )
  }

  static getRestoringGridDataStep() {
    const gridData = (window as any).getGridData();

    if (isNil(gridData) || isEmpty(gridData)) {
      console.error('DemoTools: Grid data is not available')
      return
    }

    return new Step({
      type: 'custom',
      title: 'Restoring Grid Data',
      list: false,
      customData: gridData,
      func: () => {
        const activeStep = (window as any).demoTools.demo.steps[(window as any).demoTools.demo.state.activeStep];
        (window as any).setGridData(null, activeStep.customData)
      }
    })
  }
}