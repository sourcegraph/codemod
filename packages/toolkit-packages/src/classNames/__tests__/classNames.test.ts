import { printNode } from 'ts-morph'
import { factory } from 'typescript'

import { createSourceFile } from '@sourcegraph/codemod-toolkit-ts'

import {
    CLASSNAMES_IDENTIFIER,
    CLASSNAMES_MODULE_SPECIFIER,
    CLSX_IDENTIFIER,
    wrapIntoClassNamesUtility,
    addClassNamesUtilImportIfNeeded,
    addClsxUtilImportIfNeeded,
    wrapIntoClsxUtility,
} from '..'

describe('`classNames` helpers', () => {
    describe('wrapIntoClassNamesUtility', () => {
        it('wraps arguments into `classNames` function call', () => {
            const classNamesArguments = [factory.createStringLiteral('first'), factory.createStringLiteral('second')]
            const classNamesCall = wrapIntoClassNamesUtility(classNamesArguments)

            expect(printNode(classNamesCall)).toEqual(`${CLASSNAMES_IDENTIFIER}("first", "second")`)
        })
    })

    describe('wrapIntoClsxUtility', () => {
        it('wraps arguments into `clsx` function call', () => {
            const classNamesArguments = [factory.createStringLiteral('first'), factory.createStringLiteral('second')]
            const classNamesCall = wrapIntoClsxUtility(classNamesArguments)

            expect(printNode(classNamesCall)).toEqual(`${CLSX_IDENTIFIER}("first", "second")`)
        })
    })

    describe('addClassNamesUtilImportIfNeeded', () => {
        const classNamesImport = `import ${CLASSNAMES_IDENTIFIER} from '${CLASSNAMES_MODULE_SPECIFIER}'`

        it('adds `classNames` import if needed', () => {
            const { sourceFile } = createSourceFile('<div className={classNames("wow")} />')
            const hasClassNamesImport = () => {
                return sourceFile.getText().includes(classNamesImport)
            }

            expect(hasClassNamesImport()).toBe(false)
            addClassNamesUtilImportIfNeeded(sourceFile)
            expect(hasClassNamesImport()).toBe(true)
        })

        it("doesn't duplicate `classnames` import", () => {
            const { sourceFile } = createSourceFile('<div className={classNames("wow")} />')

            addClassNamesUtilImportIfNeeded(sourceFile)
            addClassNamesUtilImportIfNeeded(sourceFile)

            const classNamesMatches = sourceFile.getText().match(new RegExp(classNamesImport, 'g'))
            expect(classNamesMatches?.length).toEqual(1)
        })

        it("doesn't add `classnames` import if `classNames` util is not used", () => {
            const { sourceFile } = createSourceFile('<div className="wow" />')

            addClassNamesUtilImportIfNeeded(sourceFile)

            expect(sourceFile.getText().includes(CLASSNAMES_MODULE_SPECIFIER)).toBe(false)
        })
    })

    describe('addClsxUtilImportIfNeeded', () => {
        const clsxImport = `import ${CLSX_IDENTIFIER} from '${CLSX_IDENTIFIER}'`

        it('adds `clsx` import if needed', () => {
            const { sourceFile } = createSourceFile('<div className={clsx("wow")} />')
            const hasClsxImtmport = () => {
                console.log(sourceFile.getText());
                return sourceFile.getText().includes(clsxImport)
            }

            expect(hasClsxImtmport()).toBe(false)
            addClsxUtilImportIfNeeded(sourceFile)
            expect(hasClsxImtmport()).toBe(true)
        })

        it("doesn't duplicate `clsx` import", () => {
            const { sourceFile } = createSourceFile('<div className={clsx("wow")} />')

            addClsxUtilImportIfNeeded(sourceFile)
            addClsxUtilImportIfNeeded(sourceFile)

            const clsxMatches = sourceFile.getText().match(new RegExp(clsxImport, 'g'))
            expect(clsxMatches?.length).toEqual(1)
        })

        it("doesn't add `clsx` import if `clsx` util is not used", () => {
            const { sourceFile } = createSourceFile('<div className="wow" />')

            addClsxUtilImportIfNeeded(sourceFile)

            expect(sourceFile.getText().includes(CLSX_IDENTIFIER)).toBe(false)
        })
    })
})
