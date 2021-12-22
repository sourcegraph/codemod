import { SyntaxKind } from 'ts-morph'

import { createSourceFile } from '../createSourceFile'

describe('createSourceFile', () => {
    it('create source file with provided source code', () => {
        const sourceCode = 'const x = 1'
        const { sourceFile } = createSourceFile(sourceCode)
        const identifier = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier)

        expect(sourceFile.getFullText()).toBe(sourceCode)
        expect(identifier.getText()).toBe('x')
    })
})
