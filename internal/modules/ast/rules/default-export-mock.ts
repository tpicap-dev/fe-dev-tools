import IRule from '../interfaces/IRule.ts'
import * as t from 'npm:@babel/types';
import Rule from './rule.ts'

export default class DefaultExportMock extends Rule implements IRule {
  name = 'default-export-mock'

  getVisitor = () => ({
    CallExpression: (path) => this.visit(path),
  })


  hasDefaultProperty = (node) => {
    return (
      t.isObjectExpression(node) &&
      node.properties.some(
        p =>
          t.isObjectProperty(p) &&
          t.isIdentifier(p.key, { name: "default" })
      )
    );
  }

  wrapWithDefault = (node) => {
    return t.objectExpression([
      t.objectProperty(t.identifier("default"), node),
    ])
  }

  checkNestedFunction = (path) => {
    const parentPath = path.findParent(p => {
      return p.isFunction() && (
        p.findParent(p1 => {
          return p1.isFunction() && (
            p1.findParent(p2 => {
              return p2.get("callee")?.isMemberExpression() &&
                p2.get("callee")?.get('object').isIdentifier({ name: 'jest' })
            })
          )
        })
      )
    })

    return parentPath
  }

  visit = (path) =>  {
    const callee = path.get("callee");

// match jest.mock(...) or vi.mock(...)
    if (
      !callee.isMemberExpression() ||
      !callee.get("property").isIdentifier({ name: "mock" })
    ) {
      return;
    }

    const args = path.get("arguments");
    if (args.length < 2) return;

    const factory = args[1];
    if (!factory.isFunction()) return;

// 👉 Now traverse ONLY inside the factory
    factory.traverse({
      ReturnStatement: (returnPath) => {
        const arg = returnPath.node.argument;
        if (!arg) return;

        if (t.isObjectExpression(arg) || this.hasDefaultProperty(arg) || checkNestedFunction(returnPath)) return;

        returnPath.node.argument = this.wrapWithDefault(arg);
      },
    });

// 👉 handle arrow implicit return separately
    if (
      factory.isArrowFunctionExpression() &&
      !factory.get("body").isBlockStatement()
    ) {
      const body = factory.get("body");

      if (!t.isObjectExpression(body.node) && !checkNestedFunction(factory)) {
        body.replaceWith(this.wrapWithDefault(body.node));
      }
    }
  }
}