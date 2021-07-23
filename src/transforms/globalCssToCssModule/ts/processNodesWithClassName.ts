import { ts, Identifier, StringLiteral } from 'ts-morph'

import { getClassNameNodeReplacement } from './getClassNameNodeReplacement'
import { splitClassName } from './splitClassName'

export const STYLES_IDENTIFIER = 'styles'

interface ProcessStringLiteralsOptions {
    nodesWithClassName: (Identifier | StringLiteral)[]
    exportNameMap: Record<string, string>
}

// Walk through all the `className` nodes and replace relevant classes with matching CSS module export names.
export function processNodesWithClassName(options: ProcessStringLiteralsOptions): void {
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
