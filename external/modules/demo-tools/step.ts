import { ICustomStep, IElementBoundStep, IHighlightingStep, IStep, IStepBase } from './demo-tools'

export default class Step implements IStepBase {
  static defaultInterval = 2000;

  title: IStepBase['title'];
  interval: IStepBase['interval'];
  type: IStepBase['type'];
  list: IStepBase['list'];
  selector: string;
  func: ICustomStep['func'];
  element: Partial<HTMLElement> | undefined;
  xPath: string;
  area: IHighlightingStep['area'];
  shiftX: IHighlightingStep['shiftX'];
  shiftY: IHighlightingStep['shiftY'];
  shiftWidth: IHighlightingStep['shiftWidth'];
  shiftHeight: IHighlightingStep['shiftHeight'];
  customData: IStepBase['customData'];

  constructor(step : IStep) {
    this.title = String(step.title);
    this.interval = Number(step.interval) || Step.defaultInterval;
    this.type = step.type || 'custom';
    this.list = Boolean(step.list);
    this.selector = (step as any).selector;
    this.func = step.type === 'custom' ? (step as ICustomStep).func : undefined;
    this.element = (step as IElementBoundStep).element;
    this.xPath = (step as IElementBoundStep).xPath;
    this.area = (step as IHighlightingStep).area;
    this.shiftX = (step as IHighlightingStep).shiftX;
    this.shiftY = (step as IHighlightingStep).shiftY;
    this.shiftWidth = (step as IHighlightingStep).shiftWidth;
    this.shiftHeight = (step as IHighlightingStep).shiftHeight;
    this.customData = step.customData;
  }

  get isFilled() {
    return Boolean((this.element || this.xPath || this.selector || this.func || this.area) && this.title && this.interval);
  }
}