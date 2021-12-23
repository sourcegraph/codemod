import { StringLiteral } from 'ts-morph'

export function getClassNameRegExp(className: string): RegExp {
    return new RegExp(`(^| )${className}( |$)`, 'g')
}

export function removeClassNameFromStringLiteral(node: StringLiteral, className: string): StringLiteral {
    const newStringLiteralValue = node.getLiteralValue().replace(getClassNameRegExp(className), ' ').trim()
    node.setLiteralValue(newStringLiteralValue)

    return node
}
