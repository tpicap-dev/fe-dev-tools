import IRule from '../interfaces/IRule.ts'
import * as t from 'npm:@babel/types';
import Rule from './rule.ts'

export default class RequireActual2AsyncImport extends Rule implements IRule {
  override name = 'require-actual-2-async-import'

  override getVisitor = () => ({
    Function: (path: any) => this.visit(path),
  })
  override visit = (path: any) => {
    const requireActualPath = this.getRequireActualPath(path) as any
    if (requireActualPath) {
      requireActualPath.replaceWith(this.getAwaitImportActual(requireActualPath.node.arguments[0]))
      const parentPath = requireActualPath.findParent((p: any) => p.isFunction())
      if (parentPath) {
        parentPath.node.async = true
      }
    }
  }

  getAwaitImportActual = (argument: any) => {
    return t.awaitExpression(
      t.callExpression(t.memberExpression(
          t.identifier('vi'),
          t.identifier('importActual')
        ),
        [argument]
      )
    )
  }

  getRequireActualPath(path: any) {
    let ret = null;
    path.traverse({
      CallExpression(innerPath: any) {
        if (innerPath.node.callee?.property?.name === 'requireActual') {
          innerPath.stop();
          ret = innerPath;
        }
      },
    });

    return ret;
  }
}