import IRule from '../interfaces/IRule.ts'
import Rule from './rule.ts'

export default class Jest2Vi extends Rule implements IRule {
  override name = 'jest-2-vi'
  from = 'jest'
  to = 'vi'

  constructor(from: string, to: string) {
    super()
    if (from) {
      this.from = from;
    }

    if (to) {
      this.to = to;
    }
  }

  override getVisitor = () => ({
    Identifier: (path: any) => this.visit(path),
  })

  override visit = (path: any) => {
    if (path.node.name === this.from) {
      path.node.name = this.to;
    }
  }
}