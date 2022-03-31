import { createJsxOpeningElement } from '../../../testing'
import { removeJsxAttribute, getJsxAttributeStringValue, isJsxAttributeEmpty } from '../JsxAttribute'

describe('removeJsxAttribute', () => {
    it('removes Jsx attribute', () => {
        const node = createJsxOpeningElement('const x = <button type="button" disabled={true} {...rest}>hey</button>')

        removeJsxAttribute(node, 'type')

        expect(node.print()).toEqual('<button disabled={true} {...rest}>')
    })
})

describe('getJsxAttributeStringValue', () => {
    it('returns string value of the Jsx attribute', () => {
        const node = createJsxOpeningElement('const x = <button type="button" disabled={true}>hey</button>')

        expect(getJsxAttributeStringValue(node, 'type')).toBe('button')
    })
})

describe('isJsxAttributeEmpty', () => {
    it('handles `JsxExpression` attribute initializer correctly', () => {
        const withEmptyAttribute = createJsxOpeningElement('<button className={}>')
        const withAttribute = createJsxOpeningElement('<button className={true}>')

        expect(isJsxAttributeEmpty(withEmptyAttribute, 'className')).toBe(true)
        expect(isJsxAttributeEmpty(withAttribute, 'className')).toBe(false)
    })

    it('handles `StringLiteral` attribute initializer correctly', () => {
        const withEmptyAttribute = createJsxOpeningElement('<button className="">')
        const withAttribute = createJsxOpeningElement('<button className="d-flex">')

        expect(isJsxAttributeEmpty(withEmptyAttribute, 'className')).toBe(true)
        expect(isJsxAttributeEmpty(withAttribute, 'className')).toBe(false)
    })

    it('returns `false` if `JsxAttribute` does not exist', () => {
        const node = createJsxOpeningElement('<button>')

        expect(isJsxAttributeEmpty(node, 'className')).toBe(false)
    })
})
