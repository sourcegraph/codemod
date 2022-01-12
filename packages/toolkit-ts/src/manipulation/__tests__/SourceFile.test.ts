import { createSourceFile } from '../../testing'
import { hasIdentifier } from '../SourceFile'

describe('hasIdentifier', () => {
    it('returns `true` if source files has identifier', () => {
        const { sourceFile } = createSourceFile('const x = 1')

        expect(hasIdentifier(sourceFile, 'x')).toBe(true)
    })

    it('returns `false` if source files does not have identifier', () => {
        const { sourceFile } = createSourceFile('const x = 1')

        expect(hasIdentifier(sourceFile, 'y')).toBe(false)
    })
})
