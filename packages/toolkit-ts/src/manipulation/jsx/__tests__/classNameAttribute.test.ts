import { createStringLiteral } from '../../../testing'
import { removeClassNameFromStringLiteral } from '../classNameAttribute'

interface DoTestOptions {
    initialValue: string
    valueToRemove: string
    expectedResult: string
}

function testClassNameRemoval({ initialValue, valueToRemove, expectedResult }: DoTestOptions) {
    const node = createStringLiteral(`<div className="${initialValue}" />`)

    expect(removeClassNameFromStringLiteral(node, valueToRemove).getLiteralValue()).toBe(expectedResult)
}

describe('removeClassNameFromStringLiteral', () => {
    it('removes class from the middle of the string', () => {
        testClassNameRemoval({
            initialValue: 'd-flex btn btn-primary',
            valueToRemove: 'btn',
            expectedResult: 'd-flex btn-primary',
        })
    })

    it('removes class from the beginning of the string', () => {
        testClassNameRemoval({
            initialValue: 'btn btn-primary',
            valueToRemove: 'btn',
            expectedResult: 'btn-primary',
        })
    })

    it('removes class from the end of the string', () => {
        testClassNameRemoval({
            initialValue: 'btn-primary btn',
            valueToRemove: 'btn',
            expectedResult: 'btn-primary',
        })
    })

    it('does nothing if class is not found', () => {
        testClassNameRemoval({
            initialValue: 'btn-primary another-btn',
            valueToRemove: 'btn',
            expectedResult: 'btn-primary another-btn',
        })
    })

    it('removes the only class from the string', () => {
        testClassNameRemoval({
            initialValue: 'btn',
            valueToRemove: 'btn',
            expectedResult: '',
        })
    })

    it('supports multiple classNames', () => {
        testClassNameRemoval({
            initialValue: 'btn btn-primary',
            valueToRemove: 'btn btn-primary',
            expectedResult: '',
        })
    })
})
