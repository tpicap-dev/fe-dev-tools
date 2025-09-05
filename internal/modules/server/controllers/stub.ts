import { generateStub } from '../../stub-generator/stub-generator.ts'
import ts, { InterfaceDeclaration, Node } from "npm:typescript"
// @ts-ignore
import { findIndex, isNil, propEq } from 'npm:ramda@0.28.0'
import { getInterfaceParentPath } from '../../stub-generator/utils/ast.ts'
import { pick } from 'ramda'

interface IOptions {
  override?: {
    object: any,
    include?: string[],
    exclude?: string[],
  }
}

const stubF = (path: string | null, options?: IOptions): any => {
  if (isNil(path)) {
    throw new Error('Path parameter is missing')
  }
  const decoder = new TextDecoder("utf-8")
  const sourceFile: Node = ts.createSourceFile(
    path as string,
    decoder.decode(Deno.readFileSync(path as string)),
    2,
    /*setParentNodes */ false
  );

  // delint it
  const statements: Node = sourceFile.getChildAt(0)
  if (!statements) {
    throw new Error('Declaration not found')
  }
  const interfaceDeclarationIndex = findIndex(propEq('kind', ts.SyntaxKind.InterfaceDeclaration), statements.getChildren())
  const interfaceDeclaration = statements.getChildAt(interfaceDeclarationIndex)
  if (!interfaceDeclaration) {
    const typeDeclarationIndex = findIndex(propEq('kind', ts.SyntaxKind.TypeAliasDeclaration), statements.getChildren())
    const typeDeclaration = statements.getChildAt(typeDeclarationIndex) as any
    return generateStub(statements, typeDeclaration.type as InterfaceDeclaration)
  }
  const interfaceParentPath = getInterfaceParentPath(statements)
  let stub: any
  if (isNil(interfaceParentPath)) {
    stub = generateStub(statements, interfaceDeclaration as InterfaceDeclaration)
  } else {
    stub = {
      ...stubF(interfaceParentPath as string),
      ...generateStub(statements, interfaceDeclaration as InterfaceDeclaration),
    }
  }

  if (!isNil(options) && !isNil(options?.override?.object)) {
    if (!isNil(options?.override?.include)) {
      const stubPart = pick(options?.override?.include, stub)
      stub = {
        ...options?.override?.object,
        ...stubPart,
      }
    }

    if (!isNil(options?.override?.exclude)) {
      const objectPart = pick(options?.override?.exclude, options?.override?.object)
      stub = {
        ...stub,
        ...objectPart,
      }
    }

    if (isNil(options?.override?.exclude) && isNil(options?.override?.include)) {
      stub = {
        ...stub,
        ...options?.override?.object
      }
    }
  }

  return stub
}

export default stubF