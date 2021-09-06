import { ts, NodeParentType, SyntaxKind } from 'ts-morph'
import {
    Expression,
    StringLiteral,
    CallExpression,
    JsxExpression,
    ComputedPropertyName,
    PropertyAccessExpression,
} from 'typescript'

import { wrapIntoClassNamesUtility } from '../../../utils/classNamesUtility'

export interface GetClassNameNodeReplacementOptions {
    parentNode: NodeParentType<StringLiteral>
    leftOverClassName: string
    exportNameReferences: PropertyAccessExpression[]
}

function getClassNameNodeReplacementWithoutBraces(
    options: GetClassNameNodeReplacementOptions
): PropertyAccessExpression | CallExpression {
    const { leftOverClassName, exportNameReferences } = options

    // We need to use `classNames` utility for multiple `exportNames` or for a combination of the `exportName` and `StringLiteral`.
    // className={classNames('d-flex mr-1 kek kek--primary')} -> className={classNames('d-flex mr-1', styles.kek, styles.kekPrimary)}
    if (leftOverClassName || exportNameReferences.length > 1) {
        const classNamesCallArguments: Expression[] = [...exportNameReferences]

        if (leftOverClassName) {
            classNamesCallArguments.unshift(ts.factory.createStringLiteral(leftOverClassName))
        }

        return wrapIntoClassNamesUtility(classNamesCallArguments)
    }

    // Replace one class with the `exportName`.
    // className='kek' -> className={styles.Kek}
    return exportNameReferences[0]
}

export function getClassNameNodeReplacement(
    options: GetClassNameNodeReplacementOptions
): PropertyAccessExpression | JsxExpression | ComputedPropertyName | CallExpression {
    const { parentNode, exportNameReferences } = options

    if (exportNameReferences.length === 0) {
        throw new Error('`exportNameReferences` should not be empty!')
    }

    const replacementWithoutBraces = getClassNameNodeReplacementWithoutBraces(options)

    if (parentNode.getKind() === SyntaxKind.JsxAttribute) {
        return ts.factory.createJsxExpression(undefined, replacementWithoutBraces)
    }

    if (parentNode.getKind() === SyntaxKind.PropertyAssignment) {
        return ts.factory.createComputedPropertyName(replacementWithoutBraces)
    }

    if (parentNode.getKind() === SyntaxKind.ConditionalExpression) {
        // Replace one class string inside of `ConditionalExpression` with the `exportName`.
        // className={classNames('d-flex', isActive ? 'kek' : 'pek')} -> className={classNames('d-flex', isActive ? styles.kek : 'pek')}
        return replacementWithoutBraces
    }

    throw new Error(`Unsupported 'parentNode' type: ${parentNode.compilerNode.kind}`)
}
