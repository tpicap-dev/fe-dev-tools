import ts, { InterfaceDeclaration, Node } from "npm:typescript"
import { generateStub } from '../stub-generator.ts'

const generateRandomString = (): string => {
  const length = Math.max(Math.round(Math.random() * 20), 1)
  let s = ''

  for(let i = 0; i < length; i++) {
    const n = Math.round(Math.random() * 50)

    if (n <= 25) {
      s = s + String.fromCharCode(65 + n)
    } else {
      s = s + String.fromCharCode(72 + n)
    }
  }
  return s
}

const generateRandomNumber = (): number => {
  return Math.round(Math.random() * 10000)
}

const generateRandomBoolean = (): Boolean => {
  const n = Math.round(Math.random() * 2)
  return Boolean(n)
}

const generateRandomStringPropValue = (member: any): string | undefined => {
  if (!isStringMember(member)) {
    return
  } else {
    return generateRandomString()
  }
}

const generateRandomNumberPropValue = (member: any): number | undefined => {
  if (!isNumberMember(member)) {
    return
  } else {
    return generateRandomNumber()
  }
}

const generateRandomBooleanPropValue = (member: any): Boolean | undefined => {
  if (!isBooleanMember(member)) {
    return
  } else {
    return generateRandomBoolean()
  }
}

const generateRandomArrayPropValue = (statements: Node, typeKind: number): any[] => {
  const n = Math.round(Math.random() * 20)
  const a = []

  for (let i = 0; i < n; i++) {
    a.push(getPropValue(statements, {
      type: {
        kind: typeKind
      }
    } as any))
  }

  return a
}

const generateRandomAny = () => ({})

const generateRandomUnion = (statements: Node, member: any): any => {
  const types = member?.type?.types
  let randomIndex = Math.round(Math.random() * (types?.length -1)) || 0
  const type = types[randomIndex]
  return getPropValue(statements, { type } as any)
}

const generateLiteralTypePropValue = (member: any): any => {
  return member.type.literal.text
}

export const getPropValue = (statements: Node, member: any): any => {
  if (isStringMember(member)) {
    return generateRandomStringPropValue(member)
  } else if(isNumberMember(member)) {
    return generateRandomNumberPropValue(member)
  } else if(isBooleanMember(member)) {
    return generateRandomBooleanPropValue(member)
  } else if(isLiteralTypeMember(member)) {
    return generateLiteralTypePropValue(member)
  } else if (isTypeLiteralMember(member)) {
    return generateStub(statements, member.type as InterfaceDeclaration)
  } else if (isArrayMember(member)) {
    if (isArrayTypeMember(member)) {
      return generateRandomArrayPropValue(statements, member.type.elementType.kind)
    } else if (isArrayReferenceMember(member)) {
      return generateRandomArrayPropValue(statements, member.type.typeArguments[0].kind)
    }
  } else if (isAnyMember(member)) {
    return generateRandomAny()
  } else if (isUnionMember(member)) {
    return generateRandomUnion(statements, member)
  }
}

export const isBooleanMember = (member: any): Boolean => {
  if (member.type.kind === ts.SyntaxKind.BooleanKeyword) {
    return true
  }

  if (member.type?.typeName?.escapedText === 'Boolean') {
    return true
  }

  return false
}

export const isNumberMember = (member: any): Boolean => {
  if (member.type.kind === ts.SyntaxKind.NumberKeyword) {
    return true
  }

  if (member.type?.typeName?.escapedText === 'Number') {
    return true
  }

  return false
}

export const isStringMember = (member: any): Boolean => {
  if (member.type.kind === ts.SyntaxKind.StringKeyword) {
    return true
  }

  if (member.type?.typeName?.escapedText === 'String') {
    return true
  }

  return false
}

export const isObjectMember = (member: any): Boolean => {
  if (member.type.kind === ts.SyntaxKind.ObjectKeyword) {
    return true
  }

  if (member.type?.typeName?.escapedText === 'Object') {
    return true
  }

  return false
}

export const isLiteralTypeMember = (member: any): Boolean => {
  if (member.type.kind === ts.SyntaxKind.LiteralType) {
    return true
  }

  return false
}

export const isTypeLiteralMember = (member: any): Boolean => {
  return member.type.kind === ts.SyntaxKind.TypeLiteral
}

export const isArrayMember = (member: any): Boolean => {
  if (isArrayTypeMember(member) || isArrayReferenceMember(member)) {
    return true
  }

  return false
}

export const isArrayTypeMember = (member: any): Boolean => {
  return member.type.kind === ts.SyntaxKind.ArrayType
}

export const isArrayReferenceMember = (member: any): Boolean => {
  return member.type.typeName?.escapedText === 'Array'
}

export const isAnyMember = (member: any): Boolean => {
  return member.type.kind === ts.SyntaxKind.AnyKeyword
}

export const isUnionMember = (member: any): Boolean => {
  return member.type.kind === ts.SyntaxKind.UnionType
}