import { Node, SyntaxKind } from 'ts-morph'

import { errors, createStringLiteral } from '@sourcegraph/codemod-common'

import { getParentUntilOrThrow } from '../Node'

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
