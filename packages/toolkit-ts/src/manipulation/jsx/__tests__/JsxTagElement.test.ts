import { JsxOpeningElement, JsxSelfClosingElement, SyntaxKind } from 'ts-morph'

import { createNodeOfKind } from '@sourcegraph/codemod-common'

import { setOnJsxTagElement, getTagName } from '../JsxTagElement'

describe('setOnJsxTagElement', () => {
    it('updates the structure of `JsxOpeningElement`', () => {
        const { node } = createNodeOfKind<JsxOpeningElement>(
            'const x = <button>hey</button>',
            SyntaxKind.JsxOpeningElement
        )

        setOnJsxTagElement(node, { name: 'Container' })

        expect(getTagName(node)).toBe('Container')
    })

    it('updates the structure of `JsxSelfClosingElement`', () => {
        const { node } = createNodeOfKind<JsxSelfClosingElement>(
            'const x = <button />',
            SyntaxKind.JsxSelfClosingElement
        )

        setOnJsxTagElement(node, { name: 'Container' })

        expect(getTagName(node)).toBe('Container')
    })
})
