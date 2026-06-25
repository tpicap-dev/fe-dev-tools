import IRule from '../interfaces/IRule'

export default abstract class Rule implements IRule {
  // @ts-ignore
  name: string;
  // @ts-ignore
  visit: Function;
  // @ts-ignore
  getVisitor: Function;
}