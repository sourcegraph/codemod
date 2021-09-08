import { removePrefixFromExportNameIfNeeded, getPrefixesToRemove } from '../exportNameMapPrefixes'

describe('removePrefixFromExportNameIfNeeded', () => {
    it('removes matching prefix', () => {
        const exportName = removePrefixFromExportNameIfNeeded({
            className: 'menu__button',
            exportName: 'menuButton',
            prefixesToRemove: [{ prefix: 'menu__', exportName: 'menu' }],
        })

        expect(exportName).toBe('button')
    })

    it('skips exportName without matching prefix', () => {
        expect(
            removePrefixFromExportNameIfNeeded({
                className: 'menu__button',
                exportName: 'menuButton',
                prefixesToRemove: [{ prefix: 'repo__', exportName: 'repo' }],
            })
        ).toBe('menuButton')

        expect(
            removePrefixFromExportNameIfNeeded({
                className: 'menu',
                exportName: 'menu',
                prefixesToRemove: [{ prefix: 'menu__', exportName: 'menu' }],
            })
        ).toBe('menu')
    })
})

describe('getPrefixesToRemove', () => {
    it('finds all prefixes to remove', () => {
        const prefixesToRemove = getPrefixesToRemove({
            'repo-header': 'repoHeader',
            'repo-header__button': 'repoHeaderButton',
            'repo-header--alert': 'repoHeaderAlert',
            'navbar-nav': 'navbarNav',
            spacer: 'spacer',
        })

        expect(prefixesToRemove).toEqual([{ prefix: 'repo-header__', exportName: 'repoHeader' }])
    })
})
