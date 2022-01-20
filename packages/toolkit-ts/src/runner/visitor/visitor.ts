import { errors } from '@ts-morph/common'
import signale from 'signale'

import { ManualChangeError } from '@sourcegraph/codemod-common'

import { SyntaxKindName, VisitorContext, VisitorHandlers } from './types'

/**
 * Pretty dumb visitor function for Typescript AST based on `SourceFile.forEachDescendant()` method.
 * Apart from calling `SyntaxKind` handlers for visited nodes it:
 *
 * 1. Swallows `InvalidOperationError` used for flow control in transform functions.
 * 2. Swallows `ManualChangeError` and adds relevant info to the `ManualChangeLog`.
 * 3. Logs errors.
 * 4. Handles `VisitorCustomKind` keys like `SourceFileExit` used.
 */
export function visitor(context: VisitorContext, visitorHandlers: VisitorHandlers): void {
    const { sourceFile, addManualChangeLog } = context
    const { SourceFileExit, ...nodesVisitor } = visitorHandlers

    /**
     * TODO: improve traversal control to revisit forgotten nodes.
     * In case if the parent node was transformed in the visitor handler
     * the visitor implementation will miss some descendant target nodes
     * because they were forgotten after the transformation.
     */
    sourceFile.forEachDescendant((node, traversalControl) => {
        const kindName = node.getKindName() as SyntaxKindName
        const handler = nodesVisitor[kindName]

        if (handler) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return handler(node as any, traversalControl)
            } catch (error) {
                if (error instanceof errors.InvalidOperationError) {
                    // Skip `InvalidOperationError` that is used to stop execution flow of the codemod by ts-morph.
                } else if (error instanceof ManualChangeError) {
                    addManualChangeLog({
                        node: error.node,
                        message: error.message,
                    })
                } else {
                    signale.error(error)
                }
            }
        }
    })

    if (SourceFileExit) {
        SourceFileExit(sourceFile)
    }
}
