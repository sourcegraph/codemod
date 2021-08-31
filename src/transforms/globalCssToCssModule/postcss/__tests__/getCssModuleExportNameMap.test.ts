import { getCssModuleExportNameMap } from '../getCssModuleExportNameMap'

describe('getCssModuleExportNameMap', () => {
    it('returns correct `exportNameMap`', async () => {
        const exportNameMap = await getCssModuleExportNameMap(`
            .repo-header {
                flex: none;

                &:hover {
                    opacity: 1;
                }

                &__button {
                    margin-top: 1px;
                }

                &--alert {
                    border-width: 1px 0;
                }

                .navbar-nav {
                    white-space: nowrap;
                }
            }

            .spacer {
                flex: 1 1 0;
            }
        `)

        expect(exportNameMap).toEqual({
            'repo-header': 'repoHeader',
            'repo-header__button': 'repoHeaderButton',
            'repo-header--alert': 'repoHeaderAlert',
            'navbar-nav': 'navbarNav',
            spacer: 'spacer',
        })
    })
})
