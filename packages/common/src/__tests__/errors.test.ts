import { throwFromMethodsIfUndefinedReturn } from '../errors'

describe('throwFromMethodsIfUndefinedReturn', () => {
    it('throws from object method if undefined is returned', () => {
        const object = {
            void() {
                // nothing here
            },
        }

        expect(() => {
            throwFromMethodsIfUndefinedReturn(object).void()
        }).toThrow()
    })

    it('preserves type signature of methods', () => {
        const object = {
            void(count: number, name: string) {
                if (count && name) {
                    // nothing here
                }
            },
        }

        expect(() => {
            throwFromMethodsIfUndefinedReturn(object).void(0, 'name')
        }).toThrow()
    })
})
