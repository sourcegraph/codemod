import { ts, JsxAttribute, PropertyAssignment, NodeParentType, ConditionalExpression } from 'ts-morph'
import { Expression, StringLiteral, JsxExpression, ComputedPropertyName, PropertyAccessExpression } from 'typescript'

import { wrapIntoClassNamesUtility } from './classNamesUtility'

interface GetClassNameNodeReplacementResult {
    parentNode: NodeParentType<StringLiteral>
    leftOverClassName: string
    exportNameReferences: PropertyAccessExpression[]
}

export function getClassNameNodeReplacement(
    options: GetClassNameNodeReplacementResult
): PropertyAccessExpression | JsxExpression | ComputedPropertyName {
    const { parentNode, leftOverClassName, exportNameReferences } = options

    if (parentNode instanceof JsxAttribute || parentNode instanceof PropertyAssignment) {
        const wrapIntoCorrectBraces =
            parentNode instanceof JsxAttribute
                ? (expression: Expression) => ts.factory.createJsxExpression(undefined, expression)
                : (expression: Expression) => ts.factory.createComputedPropertyName(expression)

        // We need to use `classNames` utility for multiple `exportNames` or for a combination of the `exportName` and `StringLiteral`.
        // className={classNames('d-flex mr-1 kek kek--primary')} -> className={classNames('d-flex mr-1', styles.kek, styles.kekPrimary)}
        if (leftOverClassName || exportNameReferences.length > 1) {
            const classNamesCallArguments: Expression[] = [...exportNameReferences]

            if (leftOverClassName) {
                classNamesCallArguments.unshift(ts.factory.createStringLiteral(leftOverClassName))
            }

            return wrapIntoCorrectBraces(wrapIntoClassNamesUtility(classNamesCallArguments))
        }

        // Replace one class with the `exportName`.
        // className='kek' -> className={styles.Kek}
        return wrapIntoCorrectBraces(exportNameReferences[0])
    }

    if (parentNode instanceof ConditionalExpression) {
        // Replace one class string inside of `ConditionalExpression` with the `exportName`.
        // className={classNames('d-flex', isActive ? 'kek' : 'pek')} -> className={classNames('d-flex', isActive ? styles.kek : 'pek')}
        return exportNameReferences[0]
    }

    throw new Error(`Unsupported 'parentNode' type: ${parentNode.compilerNode.kind}`)
}
