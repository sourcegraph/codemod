import { StringLiteral } from 'ts-morph'

export function removeClassNameFromStringLiteral(node: StringLiteral, className: string): StringLiteral {
    const classNamesToRemove = className.split(' ')

    const newStringLiteralValue = node
        .getLiteralValue()
        .split(' ')
        .filter(item => {
            return !classNamesToRemove.some(toRemove => {
                return toRemove === item
            })
        })
        .join(' ')

    node.setLiteralValue(newStringLiteralValue)

    return node
}
