import { createJsxOpeningElement } from '../../../testing'
import { addAsJsxAttribute } from '../asAttribute'

describe('addAsJsxAttribute', () => {
    it('adds `as` Jsx attribute to HTML element', () => {
        const node = createJsxOpeningElement('const x = <Button>hey</Button>')

        expect(addAsJsxAttribute(node, 'div').getText()).toBe('<Button as="div">')
    })

    it('adds `as` Jsx attribute to React component', () => {
        const node = createJsxOpeningElement('const x = <Button>hey</Button>')

        expect(addAsJsxAttribute(node, 'Link').getText()).toBe('<Button as={Link}>')
    })
})
