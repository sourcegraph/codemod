import { ts, Identifier, StringLiteral } from 'ts-morph'

import { getClassNameNodeReplacement } from './getClassNameNodeReplacement'
import { splitClassName } from './splitClassName'

export const STYLES_IDENTIFIER = 'styles'

interface ProcessNodesWithClassNameOptions {
    nodesWithClassName: (Identifier | StringLiteral)[]
    exportNameMap: Record<string, string>
}

/**
 * Walk through all the `className` nodes and replace relevant classes with matching CSS module export names.
 *
 * Example:
 *
 * ```ts
 * processNodesWithClassName({
 *   exportNameMap: { kek: "kek", kek--wow: "kekWow" }
 *   nodesWithClassName: [
 *     <div className="kek kek--wow d-flex" />,
 *     <div className={isActive ? 'kek' : 'd-flex'} />,
 *     <div className="d-flex m-1" />,
 *   ]
 * })
 * ```
 *
 * Nodes with matches between `exportNameMap` and `className` prop will be replaced with new nodes:
 *
 * ```tsx
 *   <div className="kek kek--wow d-flex" /> -> <div className={classNames("d-flex", styles.kek styles.kekWow)} />
 *   <div className={isActive ? 'kek' : 'd-flex'} /> -> <div className={isActive ? styles.kek : 'd-flex'} />
 * ```
 *
 * Nodes without matching `exportNameMap` classes will be skipped without changes.
 *
 * <div className="d-flex m-1" /> -> left without changes
 */
export function processNodesWithClassName(options: ProcessNodesWithClassNameOptions): void {
    const { nodesWithClassName, exportNameMap } = options

    for (const nodeWithClassName of nodesWithClassName) {
        const classNameStringValue =
            nodeWithClassName instanceof StringLiteral
                ? nodeWithClassName.getLiteralText()
                : nodeWithClassName.getText()

        const { exportNames, leftOverClassnames } = splitClassName(classNameStringValue, exportNameMap)

        // There's nothing to update in this `className` node.
        if (exportNames.length === 0) {
            continue
        }

        const exportNameReferences = exportNames.map(exportName =>
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(STYLES_IDENTIFIER), exportName)
        )

        nodeWithClassName.transform(() =>
            getClassNameNodeReplacement({
                parentNode: nodeWithClassName.getParent(),
                leftOverClassName: leftOverClassnames.join(' '),
                exportNameReferences,
            })
        )
    }
}
