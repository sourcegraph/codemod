import { Node, SyntaxKind } from 'ts-morph'

import { errors } from '@sourcegraph/codemod-common'

import { isImportedFromModule } from '..'
import { createCallExpression, createStringLiteral } from '../../testing'
import { getParentUntilOrThrow } from '../Node'

describe('Node', () => {
    describe('getParentUntilOrThrow', () => {
        const node = createStringLiteral(`
            export const Button = () => {
                return (
                    <div>
                        <button className="btn" />
                    </div>
                )
            }
        `)

        it('returns parent of kind if it exits', () => {
            expect(getParentUntilOrThrow(node, Node.isArrowFunction).getKind()).toBe(SyntaxKind.ArrowFunction)
            expect(getParentUntilOrThrow(node, Node.isJsxElement).getKind()).toBe(SyntaxKind.JsxElement)
            expect(getParentUntilOrThrow(node, Node.isVariableDeclaration).getName()).toBe('Button')
        })

        it('throws if parent of kind does not exit', () => {
            expect(() => {
                return getParentUntilOrThrow(node, Node.isClassDeclaration)
            }).toThrowError(errors.InvalidOperationError)
        })
    })

    describe('isImportedFromModule', () => {
        it('default', () => {
            const node = createCallExpression(`
                import classNames from 'classNames'

                const x = classNames(this.props)
            `)

            expect(isImportedFromModule(node.getExpression(), 'classNames')).toBe(true)
        })

        it('named', () => {
            const node = createCallExpression(`
                import { classNames } from 'classNames'

                const x = classNames(this.props)
            `)

            expect(isImportedFromModule(node.getExpression(), 'classNames')).toBe(true)
        })

        it('no named', () => {
            const node = createCallExpression(`
                import { classNames } from 'whaaat'

                const x = classNames(this.props)
            `)

            expect(isImportedFromModule(node.getExpression(), 'classNames')).toBe(false)
        })

        it('no default', () => {
            const node = createCallExpression(`
                import classNames from 'whaaat'

                const x = classNames(this.props)
            `)

            expect(isImportedFromModule(node.getExpression(), 'classNames')).toBe(false)
        })

        it('just no', () => {
            const node = createCallExpression(`
                const x = classNames(this.props)
            `)

            expect(isImportedFromModule(node.getExpression(), 'classNames')).toBe(false)
        })
    })
})
