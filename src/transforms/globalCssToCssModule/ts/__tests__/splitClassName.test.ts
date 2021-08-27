import { splitClassName } from '../splitClassName'

describe('splitClassName', () => {
    it('splits correctly', () => {
        const { exportNames, leftOverClassnames } = splitClassName('kek kek--wow d-flex mr-1', {
            kek: 'kek',
            'kek--wow': 'kekWow',
        })

        expect(exportNames).toEqual(['kek', 'kekWow'])
        expect(leftOverClassnames).toEqual(['d-flex', 'mr-1'])
    })
})
