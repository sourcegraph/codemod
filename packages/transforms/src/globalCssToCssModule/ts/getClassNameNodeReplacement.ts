import { ts, NodeParentType, SyntaxKind } from 'ts-morph'

import { wrapIntoClassNamesUtility, CLASSNAMES_IDENTIFIER } from '@sourcegraph/codemod-toolkit-packages'

export interface GetClassNameNodeReplacementOptions {
    parentNode: NodeParentType<ts.StringLiteral>
    leftOverClassName: string
    exportNameReferences: ts.PropertyAccessExpression[]
}

function getClassNameNodeReplacementWithoutBraces(
    options: GetClassNameNodeReplacementOptions
): ts.PropertyAccessExpression | ts.CallExpression | ts.Expression[] {
    const { leftOverClassName, exportNameReferences, parentNode } = options

    const isInClassnamesCall =
        ts.isCallExpression(parentNode.compilerNode) &&
        parentNode.compilerNode.expression.getText() === CLASSNAMES_IDENTIFIER

    // We need to use `classNames` utility for multiple `exportNames` or for a combination of the `exportName` and `StringLiteral`.
    // className={classNames('d-flex mr-1 kek kek--primary')} -> className={classNames('d-flex mr-1', styles.kek, styles.kekPrimary)}
    if (leftOverClassName || exportNameReferences.length > 1) {
        const classNamesCallArguments: ts.Expression[] = [...exportNameReferences]

        if (leftOverClassName) {
            classNamesCallArguments.unshift(ts.factory.createStringLiteral(leftOverClassName))
        }

        if (isInClassnamesCall) {
            return classNamesCallArguments
        }

        return wrapIntoClassNamesUtility(classNamesCallArguments)
    }

    // Replace one class with the `exportName`.
    // className='kek' -> className={styles.Kek}
    return exportNameReferences[0]
}

type GetClassNameNodeReplacementResult =
    | {
          replacement: ts.PropertyAccessExpression | ts.JsxExpression | ts.ComputedPropertyName | ts.CallExpression
          isParentTransformed: false
      }
    | {
          replacement: null
          isParentTransformed: true
      }

/**
 * Transforms node with className. In case the parentNode
 */
export function getClassNameNodeReplacement(
    options: GetClassNameNodeReplacementOptions
): GetClassNameNodeReplacementResult {
    const { parentNode, exportNameReferences } = options
    const parentKind = parentNode.getKind()
    const parentCompilerNode = parentNode.compilerNode

    if (exportNameReferences.length === 0) {
        throw new Error('`exportNameReferences` should not be empty!')
    }

    const replacementWithoutBraces = getClassNameNodeReplacementWithoutBraces(options)

    if (Array.isArray(replacementWithoutBraces)) {
        if (ts.isCallExpression(parentCompilerNode)) {
            // In case replacement is already in `classNames` call —> transform the parentNode
            // and return `false` to restart node transform to avoid missing nested items which were unmounted during parentNode change.
            parentNode.transform(() => {
                return ts.factory.createCallExpression(parentCompilerNode.expression, undefined, [
                    ...replacementWithoutBraces,
                    ...parentCompilerNode.arguments.filter(argument => {
                        return argument.kind !== SyntaxKind.StringLiteral
                    }),
                ])
            })

            return { isParentTransformed: true, replacement: null }
        }

        throw new Error(`Unhandled parentNode: ${parentNode.getFullText()}`)
    }

    if (
        parentKind === SyntaxKind.ConditionalExpression ||
        parentKind === SyntaxKind.CallExpression ||
        parentKind === SyntaxKind.BinaryExpression ||
        parentKind === SyntaxKind.VariableDeclaration
    ) {
        // Replace one class string inside of `ConditionalExpression` with the `exportName`.
        // className={classNames('d-flex', isActive ? 'kek' : 'pek')} -> className={classNames('d-flex', isActive ? styles.kek : 'pek')}
        return { isParentTransformed: false, replacement: replacementWithoutBraces }
    }

    if (parentKind === SyntaxKind.JsxAttribute) {
        const replacement = ts.factory.createJsxExpression(undefined, replacementWithoutBraces)

        return { isParentTransformed: false, replacement }
    }

    if (parentKind === SyntaxKind.PropertyAssignment) {
        const replacement = ts.factory.createComputedPropertyName(replacementWithoutBraces)

        return { isParentTransformed: false, replacement }
    }

    throw new Error(`Unsupported 'parentNode' type: ${parentNode.getKindName()} ${parentNode.getFullText()}`)
}
