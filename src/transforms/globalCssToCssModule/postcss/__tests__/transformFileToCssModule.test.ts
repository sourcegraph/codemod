import { transformFileToCssModule } from '../transformFileToCssModule'

const replaceWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

describe('transformFileToCssModule', () => {
    it('correctly transforms provided CSS to CSS module', async () => {
        const cssSource = `
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
            }

            .theme-light {
                .spacer {
                    flex: 1 1 0;
                }
            }
        `

        const expectedCssModuleSource = `
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
                }

                /* &__button comment*/
                .button {
                    margin-top: 1px;
                }

                :global(.theme-light) {
                    .spacer {
                        flex: 1 1 0;
                    }
                }
        `

        const { css, filePath } = await transformFileToCssModule(cssSource, 'whatever.scss')

        expect(replaceWhitespace(css)).toEqual(replaceWhitespace(expectedCssModuleSource))
        expect(filePath).toEqual('whatever.module.scss')
    })
})
