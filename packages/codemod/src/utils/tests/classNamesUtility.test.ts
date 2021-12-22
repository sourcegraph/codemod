import { printNode } from 'ts-morph'
import { factory } from 'typescript'

import {
    CLASSNAMES_IDENTIFIER,
    CLASSNAMES_MODULE_SPECIFIER,
    wrapIntoClassNamesUtility,
    addClassNamesUtilImportIfNeeded,
} from '../classNamesUtility'

import { createSourceFile } from '.'

describe('`classNames` helpers', () => {
    describe('wrapIntoClassNamesUtility', () => {
        it('wraps arguments into `classNames` function call', () => {
            const classNamesArguments = [factory.createStringLiteral('first'), factory.createStringLiteral('second')]
            const classNamesCall = wrapIntoClassNamesUtility(classNamesArguments)

            expect(printNode(classNamesCall)).toEqual(`${CLASSNAMES_IDENTIFIER}("first", "second")`)
        })
    })

    describe('addClassNamesUtilImportIfNeeded', () => {
        const classNamesImport = `import ${CLASSNAMES_IDENTIFIER} from "${CLASSNAMES_MODULE_SPECIFIER}"`

        it('adds `classNames` import if needed', () => {
            const sourceFile = createSourceFile('<div className={classNames("wow")} />')
            const hasClassNamesImport = () => sourceFile.getText().includes(classNamesImport)

            expect(hasClassNamesImport()).toBe(false)
            addClassNamesUtilImportIfNeeded(sourceFile)
            expect(hasClassNamesImport()).toBe(true)
        })

        it("doesn't duplicate `classnames` import", () => {
            const sourceFile = createSourceFile('<div className={classNames("wow")} />')

            addClassNamesUtilImportIfNeeded(sourceFile)
            addClassNamesUtilImportIfNeeded(sourceFile)

            const classNamesMatches = sourceFile.getText().match(new RegExp(classNamesImport, 'g'))
            expect(classNamesMatches?.length).toEqual(1)
        })

        it("doesn't add `classnames` import if `classNames` util is not used", () => {
            const sourceFile = createSourceFile('<div className="wow" />')

            addClassNamesUtilImportIfNeeded(sourceFile)

            expect(sourceFile.getText().includes(CLASSNAMES_MODULE_SPECIFIER)).toBe(false)
        })
    })
})
