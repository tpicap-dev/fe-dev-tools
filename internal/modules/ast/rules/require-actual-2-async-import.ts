import IRule from 'external/modules/ast/interfaces/IRule'
import * as t from 'npm:@babel/types';

export default class RequireActual2AsyncImport implements IRule {
  name = 'require-actual-2-async-import'
  visit = (path) => {
    const requireActualPath = this.getRequireActualPath(path)
    if (requireActualPath) {
      requireActualPath.replaceWith(this.getAwaitImportActual(requireActualPath.node.arguments[0]))
      path.node.async = true
    }
  }

  getAwaitImportActual = (argument) => {
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
      CallExpression(innerPath) {
        if (innerPath.node.callee?.property?.name === 'requireActual') {
          innerPath.stop();
          ret = innerPath;
        }
      },
    });

    return ret;
  }
}