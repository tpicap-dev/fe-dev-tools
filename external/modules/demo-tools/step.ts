import { ICustomStep, IElementBoundStep, IHighlightingStep, IInputBoundStep, IStep, IStepBase } from './demo'
import { equals, intersection, isNil, values } from 'ramda'
import { getElementByXPath } from 'external/utils/utils'

enum X_PATH_ERROR {
  CLASS_MISTMATCH = 'Class mistmatch: ',
  ID_MISTMATCH = 'ID mistmatch: ',
  ELEMENT_NOT_FOUND = 'Element not found',
}

export default class Step implements IStepBase {
  static defaultInterval = 2000;

  title: IStepBase['title'];
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
  value: IInputBoundStep['value'];
  keyboardKey: IElementBoundStep['keyboardKey'];

  constructor(step : Partial<IStep>) {
    this.title = String(step.title);
    this.interval = Number(step.interval) || Step.defaultInterval;
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
    this.customData = step.customData ? JSON.stringify(step.customData) : undefined;
    this.xPathCheck = typeof (step as IElementBoundStep).xPathCheck === 'boolean' ? (step as IElementBoundStep).xPathCheck : 'ignored';
    this.value = (step as IInputBoundStep).value ? String((step as IInputBoundStep).value) : undefined;
    this.keyboardKey = (step as IElementBoundStep).keyboardKey ? String((step as IElementBoundStep).keyboardKey) as IElementBoundStep['keyboardKey']  : undefined;
  }

  get isFilled() {
    return Boolean((this.element || this.xPath || this.selector || this.func || this.area) && this.title && this.interval);
  }

  get xPathError(): string | null {
    if (!(this as IElementBoundStep).xPath) {
      return null
    }

    if (!this.element) {
      return null
    }

    const el = getElementByXPath((this as IElementBoundStep).xPath)

    if (!el) {
      return `${X_PATH_ERROR.ELEMENT_NOT_FOUND}: ${(this as IElementBoundStep).element.toString()}`
    }

    if (el instanceof HTMLElement) {
      if (!equals(el.id, this.element.id)) {
        return `${X_PATH_ERROR.ID_MISTMATCH}: ${el.id || '-empty-'} !== ${this.element.id || '-empty-'}`
      }

      const intersectionClasses = intersection(values(el.classList), values(this.element.classList))
      const excessiveClasses = values(el.classList).filter(c => !values(this.element.classList).includes(c))
      const missingClasses = values(this.element.classList).filter(c => !values(el.classList).includes(c))
      if (Math.abs(1 - intersectionClasses.length / values(this.element.classList).length) > 0.25) {
        return `${X_PATH_ERROR.CLASS_MISTMATCH}\n\tMissing classes: ${missingClasses.join(', ')}\n\tExcessive classes: ${excessiveClasses.join(', ')}`
      }
    }

    return null
  }

  get hasCorrectXPath(): boolean {
    return this.xPathError === null
  }

  get isElementBound() {
    return !isNil(this.selector) || !isNil(this.xPath) || !isNil((this as IHighlightingStep).area)
  }
}