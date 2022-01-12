import { Node } from 'ts-morph'
import {} from 'type-fest'

import { errors } from '@sourcegraph/codemod-common'

export function getParentUntil<T extends Node>(
    start: Node,
    condition: (parent: Node, child: Node) => parent is T
): T | undefined {
    let node = start
    let parent = start.getParent()

    while (parent && !condition(parent, node)) {
        node = parent
        parent = node.getParent()
    }

    return parent
}

export function getParentUntilOrThrow<T extends Node>(
    start: Node,
    condition: (parent: Node, child: Node) => parent is T
): T {
    return errors.throwIfNullOrUndefined(
        getParentUntil(start, condition),
        'Expected to find a parent matching condition provided.'
    )
}

export function isImportedFromModule(node: Node, moduleSpecifier: string): boolean {
    const declarations = node.getSymbol()?.getDeclarations()

    const importRelatedDeclaration = declarations?.find(declaration => {
        return Node.isImportClause(declaration) || Node.isImportSpecifier(declaration)
    })

    if (!importRelatedDeclaration) {
        return false
    }

    return (
        getParentUntilOrThrow(importRelatedDeclaration, Node.isImportDeclaration)
            .getModuleSpecifier()
            .getLiteralText() === moduleSpecifier
    )
}
