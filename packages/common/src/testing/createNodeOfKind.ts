import { SyntaxKind, Node, StringLiteral } from 'ts-morph'

import { IsAny } from '../types'

import { createSourceFile, CreateSourceFileResult } from './createSourceFile'

interface CreateNodeOfKindResult<TDescendant extends Node> extends CreateSourceFileResult {
    node: IsAny<TDescendant> extends true ? Node : TDescendant
}

export function createNodeOfKind<TDescendant extends Node>(
    fileSource: string,
    kind: SyntaxKind
): CreateNodeOfKindResult<TDescendant> {
    const sourceFileInfo = createSourceFile(fileSource)

    return {
        ...sourceFileInfo,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        node: sourceFileInfo.sourceFile.getFirstDescendantByKindOrThrow(kind) as any,
    }
}

export function createStringLiteral(text: string): StringLiteral {
    return createNodeOfKind<StringLiteral>(text, SyntaxKind.StringLiteral).node
}
