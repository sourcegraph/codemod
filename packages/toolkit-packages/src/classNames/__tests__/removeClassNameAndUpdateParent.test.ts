import { SourceFile, SyntaxKind } from 'ts-morph'

import { createSourceFile } from '@sourcegraph/codemod-toolkit-ts'

import { removeClassNameAndUpdateJsxElement } from '../removeClassNameAndUpdateJsxElement'

function getClassNameInitializer(sourceFile: SourceFile) {
    const jsxAttribute = sourceFile.getFirstDescendantByKind(SyntaxKind.JsxAttribute)
    return jsxAttribute?.getInitializer()?.getText()
}

interface TestClassRemovalOptions {
    fileSource: string
    classToRemove: string
    isRemovalExpected: boolean
    isManualChangeRequired?: boolean
    expectedClassNameInitializer?: string
}

function testClassRemoval(options: TestClassRemovalOptions) {
    const {
        fileSource,
        classToRemove,
        isManualChangeRequired = false,
        isRemovalExpected,
        expectedClassNameInitializer,
    } = options

    const { sourceFile } = createSourceFile(`
      import classNames from 'classnames'

      ${fileSource}
    `)

    const jsxTagElement = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.JsxSelfClosingElement)
    const stringLiteral = jsxTagElement.getFirstDescendantByKindOrThrow(SyntaxKind.StringLiteral)

    const { isRemoved, manualChangeLog } = removeClassNameAndUpdateJsxElement(stringLiteral, classToRemove)

    expect(isRemoved).toBe(isRemovalExpected)
    expect(Boolean(manualChangeLog)).toBe(isManualChangeRequired)
    expect(getClassNameInitializer(sourceFile)).toEqual(expectedClassNameInitializer)
}

describe('removeClassNameAndUpdateJsxElement', () => {
    describe('handles `JsxAttribute` parent', () => {
        it('removes class from the existing `className` value', () => {
            testClassRemoval({
                fileSource: 'const node = <div className="btn btn-primary" />',
                classToRemove: 'btn',
                isRemovalExpected: true,
                expectedClassNameInitializer: '"btn-primary"',
            })
        })

        it('removes the `className` Jsx attribute if the leftover if an empty string', () => {
            testClassRemoval({
                fileSource: 'const node = <div className="btn" />',
                classToRemove: 'btn',
                isRemovalExpected: true,
                expectedClassNameInitializer: undefined,
            })
        })
    })

    describe('handles `CallExpression` parent', () => {
        it('removes class from the `classNames` call argument', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames("btn btn-primary", props.className)} />',
                classToRemove: 'btn',
                isRemovalExpected: true,
                expectedClassNameInitializer: '{classNames("btn-primary", props.className)}',
            })
        })

        it('removes the `className` Jsx attribute if the leftover `JsxExpression` is empty', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames("btn btn-primary")} />',
                classToRemove: 'btn btn-primary',
                isRemovalExpected: true,
                expectedClassNameInitializer: undefined,
            })
        })

        it('removes `classNames` call if the leftover argument is `StringLiteral`', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames("btn btn-primary", "d-flex")} />',
                classToRemove: 'btn btn-primary',
                isRemovalExpected: true,
                expectedClassNameInitializer: '"d-flex"',
            })
        })

        it('removes `classNames` call if the leftover argument is `Expression`', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames("btn btn-primary", props.className)} />',
                classToRemove: 'btn btn-primary',
                isRemovalExpected: true,
                expectedClassNameInitializer: '{props.className}',
            })
        })

        it('keeps `classNames` call if the leftover argument is `BinaryExpression`', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames("btn btn-primary", isActive && "d-flex")} />',
                classToRemove: 'btn btn-primary',
                isRemovalExpected: true,
                expectedClassNameInitializer: '{classNames(isActive && "d-flex")}',
            })
        })

        it('keeps `classNames` call if the leftover argument is `ConditionalExpression`', () => {
            testClassRemoval({
                fileSource:
                    'const node = <div className={classNames("btn btn-primary", isActive ? "d-flex" : "d-none")} />',
                classToRemove: 'btn btn-primary',
                isRemovalExpected: true,
                expectedClassNameInitializer: '{classNames(isActive ? "d-flex" : "d-none")}',
            })
        })

        it('does not remove className from `ConditionalExpression`', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames(isActive ? "btn" : "kek")} />',
                classToRemove: 'btn',
                isRemovalExpected: false,
                isManualChangeRequired: true,
                expectedClassNameInitializer: '{classNames(isActive ? "btn" : "kek")}',
            })
        })

        it('does not remove className from `PropertyAssignment`', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames({ [isActive]: "btn" })} />',
                classToRemove: 'btn',
                isRemovalExpected: false,
                isManualChangeRequired: true,
                expectedClassNameInitializer: '{classNames({ [isActive]: "btn" })}',
            })
        })

        it('does not remove className from `BinaryExpression`', () => {
            testClassRemoval({
                fileSource: 'const node = <div className={classNames(isActive && "btn")} />',
                classToRemove: 'btn',
                isRemovalExpected: false,
                isManualChangeRequired: true,
                expectedClassNameInitializer: '{classNames(isActive && "btn")}',
            })
        })
    })
})
