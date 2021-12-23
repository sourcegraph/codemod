import { SyntaxKind } from 'ts-morph'

import { createSourceFile } from '@sourcegraph/codemod-common'

import { addOrUpdateImportIfIdentifierIsUsed } from '../ImportDeclaration'

const classNamesImportStructure = {
    defaultImport: 'classNames',
    moduleSpecifier: 'classnames',
}

describe('addOrUpdateImportIfIdentifierIsUsed', () => {
    it('adds default import if needed', () => {
        const { sourceFile } = createSourceFile('const className = classNames("d-flex", )')

        addOrUpdateImportIfIdentifierIsUsed({ sourceFile, importStructure: classNamesImportStructure })
        const importDeclaration = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)

        expect(importDeclaration.getModuleSpecifier().getLiteralValue()).toBe(classNamesImportStructure.moduleSpecifier)
        expect(importDeclaration.getDefaultImport()?.getText()).toBe(classNamesImportStructure.defaultImport)
    })

    it('adds named imports if needed', () => {
        const { sourceFile } = createSourceFile('const markup = <Container><Button /><Container>')
        const importStructure = {
            namedImports: ['Button', 'Container', 'Input'],
            moduleSpecifier: '@sourcegraph/wildcard',
        }

        addOrUpdateImportIfIdentifierIsUsed({ sourceFile, importStructure })
        const importDeclaration = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
        const namedImports = importDeclaration.getNamedImports()

        expect(importDeclaration.getModuleSpecifier().getLiteralValue()).toBe(importStructure.moduleSpecifier)
        expect(namedImports.length).toBe(2)
        expect(
            namedImports.map(namedImport => {
                return namedImport.getText()
            })
        ).toEqual(['Button', 'Container'])
    })

    it('updates existing import declaration if needed', () => {
        const { sourceFile } = createSourceFile(`
            import { Container } from '@sourcegraph/wildcard'

            const markup = <Container><Button /><Container>
        `)

        const importStructure = {
            namedImports: ['Button', 'Container', 'Input'],
            moduleSpecifier: '@sourcegraph/wildcard',
        }

        addOrUpdateImportIfIdentifierIsUsed({ sourceFile, importStructure })
        const importDeclaration = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
        const namedImports = importDeclaration.getNamedImports()

        expect(importDeclaration.getModuleSpecifier().getLiteralValue()).toBe(importStructure.moduleSpecifier)
        expect(namedImports.length).toBe(2)
        expect(
            namedImports.map(namedImport => {
                return namedImport.getText()
            })
        ).toEqual(['Container', 'Button'])
    })

    it('does not add import if it already exists', () => {
        const { sourceFile } = createSourceFile(`
            import classNames from 'classnames'

            const className = classNames("d-flex", )
        `)

        addOrUpdateImportIfIdentifierIsUsed({ sourceFile, importStructure: classNamesImportStructure })
        const importDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)

        expect(importDeclarations.length).toBe(1)
    })
})
