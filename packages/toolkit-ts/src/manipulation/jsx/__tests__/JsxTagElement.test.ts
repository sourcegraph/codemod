import { JsxSelfClosingElement, SyntaxKind } from 'ts-morph'

import { createJsxOpeningElement, createNodeOfKind } from '../../../testing'
import { setOnJsxTagElement, getTagName } from '../JsxTagElement'

describe('setOnJsxTagElement', () => {
    it('updates the structure of `JsxOpeningElement`', () => {
        const node = createJsxOpeningElement('const x = <button>hey</button>')

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
