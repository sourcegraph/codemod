import { printNode, SyntaxKind, ts } from 'ts-morph'

import { createSourceFile } from '@sourcegraph/codemod-toolkit-ts'

import { getClassNameNodeReplacement, GetClassNameNodeReplacementOptions } from '../getClassNameNodeReplacement'
import { getNodesWithClassName } from '../getNodesWithClassName'

describe('getClassNameNodeReplacement', () => {
    const leftOverClassName = 'hey test'

    const getParentFromFirstClassNameNode = (fileSource: string) => {
        const [nodeWithClassName] = getNodesWithClassName(createSourceFile(fileSource).sourceFile)

        return nodeWithClassName.getParent()
    }

    const exportNameReferences = ['button', 'buttonActive'].map(exportName => {
        return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('styles'), exportName)
    })

    const testCases = [
        {
            fileSource: '<div className="whatever" />',
            parentKind: 'JSXAttribute',
            replacement: {
                kind: SyntaxKind.JsxExpression,
                withLeftOverClassName: `{classNames("${leftOverClassName}", styles.button, styles.buttonActive)}`,
                noLeftOverClassName: '{classNames(styles.button, styles.buttonActive)}',
                oneExportName: '{styles.button}',
            },
        },
        {
            fileSource: '<div className={classNames({ whatever: isActive })} />',
            parentKind: 'PropertyAssignment',
            replacement: {
                kind: SyntaxKind.ComputedPropertyName,
                withLeftOverClassName: `[classNames("${leftOverClassName}", styles.button, styles.buttonActive)]`,
                noLeftOverClassName: '[classNames(styles.button, styles.buttonActive)]',
                oneExportName: '[styles.button]',
            },
        },
        {
            fileSource: '<div className={isActive ? "whatever" : "flex"} />',
            parentKind: 'CallExpression',
            replacement: {
                kind: SyntaxKind.CallExpression,
                withLeftOverClassName: `classNames("${leftOverClassName}", styles.button, styles.buttonActive)`,
                noLeftOverClassName: 'classNames(styles.button, styles.buttonActive)',
                oneExportName: 'styles.button',
            },
        },
    ]

    describe.each(testCases)('in parent kind $parentKind', ({ fileSource, replacement: expectedReplacement }) => {
        const parentNode = getParentFromFirstClassNameNode(fileSource)
        const getReplacement = (options?: Partial<GetClassNameNodeReplacementOptions>) => {
            const result = getClassNameNodeReplacement({
                parentNode,
                exportNameReferences,
                leftOverClassName,
                classname: 'classnames',
                ...options,
            })

            if (result.isParentTransformed) {
                throw new Error('No parent transform is expected')
            }

            return result.replacement
        }

        it('returns correct replacement with `leftOverClassName` provided', () => {
            const replacement = getReplacement()

            expect(replacement.kind).toBe(expectedReplacement.kind)
            expect(printNode(replacement)).toEqual(expectedReplacement.withLeftOverClassName)
        })

        it('returns correct replacement with empty `leftOverClassName`', () => {
            const replacement = getReplacement({ leftOverClassName: '' })

            expect(replacement.kind).toBe(expectedReplacement.kind)
            expect(printNode(replacement)).toEqual(expectedReplacement.noLeftOverClassName)
        })

        it('returns correct replacement with empty `leftOverClassName` and single `exportName`', () => {
            const replacement = getReplacement({
                leftOverClassName: '',
                exportNameReferences: exportNameReferences.slice(0, 1),
            })

            expect(printNode(replacement)).toEqual(expectedReplacement.oneExportName)
        })

        it('throws if `exportNameReferences` is empty', () => {
            expect(() => {
                return getReplacement({ exportNameReferences: [] })
            }).toThrow()
        })
    })
})
