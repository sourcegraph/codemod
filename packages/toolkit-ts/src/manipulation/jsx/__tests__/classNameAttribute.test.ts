import { createStringLiteral } from '@sourcegraph/codemod-common'

import { removeClassNameFromStringLiteral } from '../classNameAttribute'

describe('removeClassNameFromStringLiteral', () => {
    interface DoTestOptions {
        initialValue: string
        valueToRemove: string
        expectedResult: string
    }

    function doTest({ initialValue, valueToRemove, expectedResult }: DoTestOptions) {
        const node = createStringLiteral(`<div className="${initialValue}" />`)

        expect(removeClassNameFromStringLiteral(node, valueToRemove).getLiteralValue()).toBe(expectedResult)
    }

    it('removes class from the middle of the string', () => {
        doTest({
            initialValue: 'd-flex btn btn-primary',
            valueToRemove: 'btn',
            expectedResult: 'd-flex btn-primary',
        })
    })

    it('removes class from the beginning of the string', () => {
        doTest({
            initialValue: 'btn btn-primary',
            valueToRemove: 'btn',
            expectedResult: 'btn-primary',
        })
    })

    it('removes class from the end of the string', () => {
        doTest({
            initialValue: 'btn-primary btn',
            valueToRemove: 'btn',
            expectedResult: 'btn-primary',
        })
    })

    it('does nothing if class is not found', () => {
        doTest({
            initialValue: 'btn-primary another-btn',
            valueToRemove: 'btn',
            expectedResult: 'btn-primary another-btn',
        })
    })

    it('removes the only class from the string', () => {
        doTest({
            initialValue: 'btn',
            valueToRemove: 'btn',
            expectedResult: '',
        })
    })
})
