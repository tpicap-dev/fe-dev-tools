import ts, { InterfaceDeclaration, Node } from "npm:typescript"
// @ts-ignore
import { isEmpty } from 'npm:ramda@0.28.0'
import { getInterfacePath } from './utils/ast.ts'
import { getPropValue } from './utils/randomizing.ts'
import stubF from '../../modules/server/controllers/stub.ts'

export const generateStub = (statements: Node, interfaceDeclaration: InterfaceDeclaration) => {
  const stub: any = {}
  if (!interfaceDeclaration) {
    throw new Error('Interface declaration not found')
  }

  if (!interfaceDeclaration.members || isEmpty(interfaceDeclaration.members)) {
    throw new Error('Interface members not found')
  }
  interfaceDeclaration.members.forEach((member: any) => {
    if (member?.name?.kind === ts.SyntaxKind.Identifier) {
      if (member?.type?.kind === ts.SyntaxKind.TypeReference && !['Array', 'Boolean', 'Number', 'Date'].includes(member?.type?.typeName?.escapedText)) {
        stub[member?.name?.escapedText] = stubF(getInterfacePath(statements, member?.type?.typeName?.escapedText))
      } else {
        stub[member?.name?.escapedText] = getPropValue(statements, member)
      }
    } else if (([ts.SyntaxKind.StringLiteral, ts.SyntaxKind.NumericLiteral, ts.SyntaxKind.ComputedPropertyName, ts.SyntaxKind.PrivateIdentifier] as Array<number>).includes(member.name.kind)){
      stub[member?.name?.text] = getPropValue(statements, member)
    }
  })

  return stub
}
