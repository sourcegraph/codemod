import { transformFileToCssModule } from '../transformFileToCssModule'

const replaceWhitespace = (value: string) => {
    return value.replace(/\s+/g, ' ').trim()
}

describe('transformFileToCssModule', () => {
    it('correctly transforms provided CSS to CSS module', async () => {
        const sourceCss = `
            @import './RepositoriesPopover';

            // .repo-header comment
            .repo-header {
                flex: none;

                &:hover {
                    opacity: 1;
                }

                // &__button comment
                &__button {
                    margin-top: 1px;
                }

                &--alert {
                    border-width: 1px 0;

                    .theme-dark & {
                        background: black;
                    }
                }

                .navbar-nav {
                    white-space: nowrap;
                }

                &:disabled &__button {
                    display: none;
                }

                @media (--xs-breakpoint-down) {
                    border-radius: var(--border-radius);
                }
            }

            .theme-light {
                .spacer {
                    flex: 1 1 0;
                }
            }
        `

        const expectedCssModuleSource = `
                @import 'wildcard/src/global-styles/breakpoints';

                /* .repo-header comment*/
                .repo-header {
                    flex: none;

                    &:hover {
                        opacity: 1;
                    }

                    &--alert {
                        border-width: 1px 0;

                        :global(.theme-dark) & {
                            background: black;
                        }
                    }

                    :global(.navbar-nav) {
                        white-space: nowrap;
                    }

                    &:disabled .button {
                        display: none;
                    }

                    @media (--xs-breakpoint-down) {
                        border-radius: var(--border-radius);
                    }
                }

                :global(.theme-light) {
                    .spacer {
                        flex: 1 1 0;
                    }
                }

                /* &__button comment*/
                .button {
                    margin-top: 1px;
                }
        `

        const { css, filePath } = await transformFileToCssModule({ sourceCss, sourceFilePath: 'whatever.scss' })

        expect(replaceWhitespace(css)).toEqual(replaceWhitespace(expectedCssModuleSource))
        expect(filePath).toEqual('whatever.module.scss')
    })
})
