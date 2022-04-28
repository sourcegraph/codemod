import { SyntaxKind } from 'ts-morph'

export const VisitorCustomKind = {
    // Called after all other visitor config kinds are processed.
    SourceFileExit: 'SourceFileExit',
} as const

// Extend `SyntaxKind` with `CustomKind` to allow custom visitor events like `SourceFileExit`.
export const VisitorKind = {
    ...SyntaxKind,
    ...VisitorCustomKind,
} as const
