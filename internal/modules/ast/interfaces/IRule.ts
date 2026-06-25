export default interface IRule {
  name: string;
  visit: Function;
  getVisitor: Function;
}