import IRule from '../interfaces/IRule.ts'
import * as t from 'npm:@babel/types';
import Rule from './rule.ts'

export default class Require2Import extends Rule implements IRule {
  override name = 'require-2-import'

  override getVisitor = () => ({
    Program: (path: any) => this.visit1(path),
    CallExpression: (path: any) => this.visit2(path),
  })

  visit1 = (path: any) =>  {
    const imports: t.ImportDeclaration[] = [];

    // Traverse only **top-level statements**
    path.get("body").forEach((stmtPath: any) => {
      // --- const x = require("foo") ---
      if (stmtPath.isVariableDeclaration()) {
        stmtPath.node.declarations.forEach((decl: any, i: number) => {
          if (
            t.isCallExpression(decl.init) &&
            t.isIdentifier(decl.init.callee, { name: "require" }) &&
            decl.init.arguments.length === 1 &&
            t.isStringLiteral(decl.init.arguments[0])
          ) {
            const source = decl.init.arguments[0].value;
            const id = decl.id;

            let importDecl;

            // default import
            if (t.isIdentifier(id)) {
              importDecl = t.importDeclaration(
                [t.importDefaultSpecifier(id)],
                t.stringLiteral(source)
              );
            }

            // destructured/named import
            else if (t.isObjectPattern(id)) {
              const specifiers = id.properties.map((prop: any) => {
                if (!t.isObjectProperty(prop)) return null;
                // @ts-ignore
                return t.importSpecifier(prop.value, prop.key);
              }).filter(Boolean) as any[];

              // @ts-ignore
              importDecl = t.importDeclaration(
                specifiers,
                t.stringLiteral(source)
              );
            }

            if (importDecl) {
              imports.push(importDecl);
              stmtPath.node.declarations[i] = null; // remove converted decl
            }
          }
        });

        // remove empty declarations
        stmtPath.node.declarations = stmtPath.node.declarations.filter(Boolean);
        if (stmtPath.node.declarations.length === 0) stmtPath.remove();
      }

      // --- require("foo"); ---
      else if (stmtPath.isExpressionStatement()) {
        const expr = stmtPath.get("expression");
        if (
          expr.isCallExpression() &&
          expr.get("callee").isIdentifier({ name: "require" }) &&
          expr.node.arguments.length === 1 &&
          t.isStringLiteral(expr.node.arguments[0])
        ) {
          imports.push(t.importDeclaration([], expr.node.arguments[0]));
          stmtPath.remove();
        }
      }
    });

    if (imports.length) {
      path.unshiftContainer("body", imports);
    }
  }

  visit2 = (path: any) => {
    if (path.get('callee').isIdentifier({ name: 'require' }) && t.isCallExpression(path)) {
      (path as any).replaceWith(this.getAwaitImport((path as any).node.arguments[0]))
      const parentPath = (path as any).findParent((p: any) => p.isFunction())
      if (parentPath) {
        parentPath.node.async = true
      }
    }
  }


  getAwaitImport = (argument: any) => {
    return t.awaitExpression(
      t.callExpression(t.identifier('import'),
        [argument]
      )
    ) as any
  }

}