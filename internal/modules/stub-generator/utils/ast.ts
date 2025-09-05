import ts, { HeritageClause, ImportDeclaration, InterfaceDeclaration, Node } from 'npm:typescript'
import constants from '../../../../shared/constants.json'  with { type: 'json' }
// @ts-ignore
import { filter, find, findIndex, head, isEmpty, isNil, path, pipe, prop, propEq } from 'npm:ramda@0.28.0'

const { PROJECT_PATH, SRC_PATH } = constants

export const getInterfaceParent = (interfaceDeclaration: InterfaceDeclaration): HeritageClause | null => {
  const heritageClauses = interfaceDeclaration?.heritageClauses || []

  if(heritageClauses.length > 0) return heritageClauses[0]
  return null
}

export const getInterfaceParentPath = (statements: Node): string | null => {
  const interfaceDeclarationIndex = findIndex(propEq('kind', ts.SyntaxKind.InterfaceDeclaration), statements.getChildren())
  const importStatements = filter(propEq('kind', ts.SyntaxKind.ImportDeclaration), statements.getChildren())
  const interfaceDeclaration = statements.getChildAt(interfaceDeclarationIndex)
  const interfaceParent = getInterfaceParent(interfaceDeclaration as InterfaceDeclaration)

  if (isNil(interfaceParent) || isEmpty(interfaceParent?.types) || isEmpty(importStatements)) {
    return null
  }

  const interfaceParentName = pipe(
    prop('types'),
    head,
    path(['expression', 'escapedText'])
  )(interfaceParent)

  return getInterfacePath(statements, interfaceParentName)
}

export const getInterfacePath = (statements: Node, interfaceName: string): string | null => {
  const importStatements = filter(propEq('kind', ts.SyntaxKind.ImportDeclaration), statements.getChildren())
  const interfaceImportNode = find((importStatement: ImportDeclaration) => importStatement?.importClause?.name?.escapedText === interfaceName, importStatements)

  if (isNil(interfaceImportNode)) {
    return null
  }

  const relativePath = interfaceImportNode?.moduleSpecifier?.text

  return `${PROJECT_PATH}/${SRC_PATH}/${relativePath}.ts`
}