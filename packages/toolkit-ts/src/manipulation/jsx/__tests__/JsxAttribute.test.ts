import { JsxOpeningElement, SyntaxKind } from 'ts-morph'

import { createNodeOfKind } from '@sourcegraph/codemod-common'

import { removeJsxAttribute, getJsxAttributeStringValue } from '../JsxAttribute'

describe('removeJsxAttribute', () => {
    it('removes JSX attribute', () => {
        const { node } = createNodeOfKind<JsxOpeningElement>(
            'const x = <button type="button" disabled={true}>hey</button>',
            SyntaxKind.JsxOpeningElement
        )

        removeJsxAttribute(node, 'type')

        expect(
            node.getAttributes().map(attribute => {
                return attribute.getText()
            })
        ).toEqual(['disabled={true}'])
    })
})

describe('getJsxAttributeStringValue', () => {
    it('returns string value of the JSX attribute', () => {
        const { node } = createNodeOfKind<JsxOpeningElement>(
            'const x = <button type="button" disabled={true}>hey</button>',
            SyntaxKind.JsxOpeningElement
        )

        expect(getJsxAttributeStringValue(node, 'type')).toBe('button')
    })
})
