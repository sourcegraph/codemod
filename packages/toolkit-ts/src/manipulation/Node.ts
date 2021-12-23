import { Node } from 'ts-morph'

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
