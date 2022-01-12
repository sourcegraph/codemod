import signale from 'signale'
import { Node } from 'ts-morph'

// TODO: move Typescript specific logic to the `toolkit-ts` package.
export class ManualChangeError extends Error {
    constructor(public node: Node, public message: string) {
        super(message)
    }
}

export interface ManualChangeLog {
    node: Node
    message: string
}

export type ManualChangesReported = Record<string, ManualChangeLog>

export interface ManualChangeList {
    manualChangesReported: ManualChangesReported
    throwManualChangeError(this: void, manualChangeLog: ManualChangeLog): void
    addManualChangeLog(this: void, manualChangeLog: ManualChangeLog): void
}

// Used to avoid the duplicate reports on the same AST node.
function getManualLogId(manualChangeLog: ManualChangeLog): string {
    const { node, message } = manualChangeLog

    return [
        node.getSourceFile().getFilePath(),
        node.getPos(),
        node.getStartLinePos(),
        node.getEndLineNumber(),
        message,
    ].join(',')
}

export function throwManualChangeError({ node, message }: ManualChangeLog): void {
    throw new ManualChangeError(node, message)
}

export function logRequiredManualChanges(manualChangesReported: ManualChangesReported): void {
    for (const { message } of Object.values(manualChangesReported)) {
        signale.log(message)
    }
}

export function createManualChangeList(): ManualChangeList {
    const manualChangesReported: ManualChangesReported = {}

    function addManualChangeLog(manualChangeLog: ManualChangeLog): void {
        const { node, message } = manualChangeLog
        const { line, column } = node.getSourceFile().getLineAndColumnAtPos(node.getPos())
        const filePath = node.getSourceFile().getFilePath()

        manualChangesReported[getManualLogId(manualChangeLog)] = {
            node,
            message: ['', `${filePath}:${line}:${column} - warning: ${message}`, `>>>    ${node.getFullText()}`].join(
                '\n'
            ),
        }
    }

    return { manualChangesReported, throwManualChangeError, addManualChangeLog }
}
