import { createSourceFile } from '@sourcegraph/codemod-common'

import { checkIfFileHasIdentifier } from '../SourceFile'

describe('checkIfFileHasIdentifier', () => {
    it('returns `true` if source files has identifier', () => {
        const { sourceFile } = createSourceFile('const x = 1')

        expect(checkIfFileHasIdentifier(sourceFile, 'x')).toBe(true)
    })

    it('returns `false` if source files does not have identifier', () => {
        const { sourceFile } = createSourceFile('const x = 1')

        expect(checkIfFileHasIdentifier(sourceFile, 'y')).toBe(false)
    })
})
