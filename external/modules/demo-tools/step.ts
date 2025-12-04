import { IClickStep, ICustomStep, IHighlightingStep, IStep, IStepBase } from './demo-tools'

export default class Step implements IStepBase {
  title: IStepBase['title'];
  interval: IStepBase['interval'];
  type: IStepBase['type'];
  list: IStepBase['list'];
  selector: string;
  func: ICustomStep['func'];
  element: HTMLElement;
  xPath: string;
  area: IHighlightingStep['area'];
  shiftX: IHighlightingStep['shiftX'];
  shiftY: IHighlightingStep['shiftY'];
  shiftWidth: IHighlightingStep['shiftWidth'];
  shiftHeight: IHighlightingStep['shiftHeight'];

  constructor(step : IStep) {
    this.title = String(step.title);
    this.interval = Number(step.interval);
    this.type = step.type || 'custom';
    this.list = Boolean(step.list);
    this.selector = (step as any).selector;
    this.func = (step as ICustomStep).func;
    this.element = (step as IClickStep).element;
    this.xPath = (step as IClickStep).xPath;
    this.area = (step as IHighlightingStep).area;
    this.shiftX = (step as IHighlightingStep).shiftX;
    this.shiftY = (step as IHighlightingStep).shiftY;
    this.shiftWidth = (step as IHighlightingStep).shiftWidth;
    this.shiftHeight = (step as IHighlightingStep).shiftHeight;
  }

  get isFilled() {
    return Boolean((this.element || this.xPath || this.selector || this.func || this.area) && this.title && this.interval);
  }
}