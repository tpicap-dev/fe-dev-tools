import IRule from '../interfaces/IRule.ts'
import Rule from './rule.ts'
import * as t from 'npm:@babel/types';

export default class WrappingCalls extends Rule implements IRule {
  name = 'wrapping-calls'
  f1 = 'f1'
  f2 = 'f2'

  constructor(f1: string, f2: string) {
    super()
    if (f1) {
      this.f1 = f1;
    }
    if (f2) {
      this.f2 = f2;
    }
  }

  getVisitor = (filePath) => ({
    FunctionDeclaration: this.visit(filePath),
    FunctionExpression: this.visit(filePath),
    ArrowFunctionExpression: this.visit(filePath),
    ClassMethod: this.visit(filePath),
    ObjectMethod: this.visit(filePath),
  })

  visit = (filePath: string) => (path: any) => {
    this.ensureBlockBody(path);

    const body = path.get('body');
    const statements = body.node.body;
    const functionName = path.node.id?.name || path.parentPath.node.id?.name || 'anonymous';
    const line = path.node.loc.start.line;
    const column = path.node.loc.start.column;

    statements.unshift(t.emptyStatement())
    statements.unshift(this.createCallbackCall(this.f1, filePath, functionName, line, column));

    path.traverse({
      ReturnStatement: (returnPath) => {
        if (returnPath.getFunctionParent() !== path) {
          return;
        }

        returnPath.insertBefore(t.emptyStatement())
        returnPath.insertBefore(
          this.createCallbackCall(this.f2, filePath, functionName, line, column)
        );
        returnPath.insertBefore(t.emptyStatement())
      },
    });

    const updatedStatements = body.node.body;
    const lastStatement =
      updatedStatements[updatedStatements.length - 1];

    const endsWithReturn =
      t.isReturnStatement(lastStatement);

    if (!endsWithReturn) {
      updatedStatements.push(t.emptyStatement())
      updatedStatements.push(
        this.createCallbackCall(this.f2, filePath, functionName, line, column)
      );
      updatedStatements.push(t.emptyStatement())
    }
  }

  createCallbackCall = (name: string, filePath: string, functionName: string = 'anonymous', line: number, column: number) => {
    const objectName = name.split('.')[0]
    const methodName = name.split('.')[1]
    let stmt

    let objIdentifier;

    if (filePath.endsWith('.ts') || filename.endsWith('.tsx')) {
      objIdentifier = t.tsAsExpression(
        t.identifier(objectName),
        t.tsAnyKeyword(),
      )
    } else {
      objIdentifier = t.identifier(objectName)
    }

    if (methodName) {
      stmt = t.tryStatement(
        t.blockStatement([
          t.expressionStatement(
            t.optionalCallExpression(
              t.optionalMemberExpression(
                objIdentifier,
                t.identifier(methodName),
                false,
                true,
              ),
              [
                t.stringLiteral(filePath),
                t.stringLiteral(functionName),
                t.numericLiteral(line),
                t.numericLiteral(column),
              ],
              true
            )
          )
        ]),
        t.catchClause(
          null,
          t.blockStatement([])
        )
      )
    } else {
      stmt = t.expressionStatement(
        t.callExpression(t.identifier(name), [
          t.stringLiteral(filePath),
          t.stringLiteral(functionName)
        ])
      );
    }

    stmt.leadingComments = [
      {
        type: 'CommentBlock',
        value: 'wrapping-call: start',
      },
    ]

    stmt.trailingComments = [
      {
        type: 'CommentBlock',
        value: 'wrapping-call: end',
      },
    ]

    return stmt;
  }

  ensureBlockBody = (path) => {
    if (!t.isBlockStatement(path.node.body)) {
      path.node.body = t.blockStatement([
        t.returnStatement(path.node.body),
      ]);
    }
  }
}