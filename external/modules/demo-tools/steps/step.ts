import {  default as DemoStep } from '../step'
import { IElementBoundStep, IStepBase } from 'external/modules/demo-tools/demo'
import { StepEditForm } from 'external/modules/demo-tools/steps/steps'

export default class Step implements Pick<
  DemoStep,
  "title" |
  "description" |
  "interval" |
  "type" |
  "list" |
  "xPathCheck" |
  "coordCheck" |
  "xPath" |
  "element" |
  "xPathError" |
  "isFilled" |
  "hasCorrectXPath" |
  "hasCorrectCoordinates" |
  "elementBoundCheck"> {

  title: IStepBase['title'];
  description: IStepBase['description'] | undefined;
  interval: IStepBase['interval'];
  type: IStepBase['type'];
  list: IStepBase['list'];
  xPathCheck: IElementBoundStep['xPathCheck'];
  coordCheck: IElementBoundStep['coordCheck'];
  xPath: string;
  element: Pick<HTMLElement, 'classList' | 'id' | 'localName'> | undefined;
  xPathError: string | null;
  isFilled: boolean;
  hasCorrectCoordinates: boolean;
  hasCorrectXPath: boolean;
  elementBoundCheck: boolean;
  editForm?: StepEditForm;
  labels?: string[];

  constructor(step: DemoStep) {
    this.title = step.title;
    this.description = step.description;
    this.interval = step.interval;
    this.type = step.type;
    this.list = step.list;
    this.xPathCheck = step.xPathCheck;
    this.coordCheck = step.coordCheck;
    this.xPath = step.xPath;
    this.element = step.element;
    this.xPathError = step.xPathError;
    this.isFilled = step.isFilled;
    this.hasCorrectCoordinates = step.hasCorrectCoordinates;
    this.hasCorrectXPath = step.hasCorrectXPath;
    this.elementBoundCheck = step.elementBoundCheck;
    this.labels = step.labels
  }
}