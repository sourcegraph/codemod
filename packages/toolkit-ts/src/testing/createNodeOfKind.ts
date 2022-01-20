import { SyntaxKind, Node, StringLiteral, CallExpression, JsxOpeningElement } from 'ts-morph'

import { IsAny } from '@sourcegraph/codemod-common'

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

// TODO: generate these helpers for every `SyntaxKind`.
export function createStringLiteral(fileSource: string): StringLiteral {
    return createNodeOfKind<StringLiteral>(fileSource, SyntaxKind.StringLiteral).node
}

export function createCallExpression(fileSource: string): CallExpression {
    return createNodeOfKind<CallExpression>(fileSource, SyntaxKind.CallExpression).node
}

export function createJsxOpeningElement(fileSource: string): JsxOpeningElement {
    return createNodeOfKind<JsxOpeningElement>(fileSource, SyntaxKind.JsxOpeningElement).node
}
