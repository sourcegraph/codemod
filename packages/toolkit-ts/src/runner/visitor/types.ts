import { Node, SyntaxKind, SourceFile, ForEachDescendantTraversalControl, KindToNodeMappings } from 'ts-morph'

import { ManualChangeList } from '@sourcegraph/codemod-common'

import { VisitorKind } from './constants'

export type VisitorKindToNodeMappings = KindToNodeMappings & {
    [VisitorKind.SourceFileExit]: SourceFile
}

export type VisitorKindType = typeof VisitorKind

export type SyntaxKindName = keyof typeof SyntaxKind
export type SyntaxKindHandler<T> = (node: T, traversal: ForEachDescendantTraversalControl) => Node | void

export type VisitorHandlers = {
    [kindName in keyof VisitorKindType]?: kindName extends SyntaxKindName
        ? SyntaxKindHandler<VisitorKindToNodeMappings[VisitorKindType[kindName]]> // Handle `SyntaxKind` visit.
        : (node: VisitorKindToNodeMappings[VisitorKindType[kindName]]) => void // Handle `CustomKind` defined in `VisitorCustomKind`.
}

export interface VisitorContext extends ManualChangeList {
    sourceFile: SourceFile
}
