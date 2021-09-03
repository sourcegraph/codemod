import { AcceptedPlugin, Container } from 'postcss'

interface UpdateImportsPluginOptions {
    breakpointsImportPath?: string
}

/**
 * PostCSS plugin that:
 * 1. Adds breakpoints @import statement if needed.
 * 2. Removes all other @import statements.
 */
export function updateImportsPlugin(options: UpdateImportsPluginOptions = {}): AcceptedPlugin {
    const { breakpointsImportPath = 'wildcard/src/global-styles/breakpoints' } = options
    let hasBreakpointsImport = false

    return {
        postcssPlugin: 'postcss-update-imports',
        AtRule(atRule) {
            const { name, params } = atRule

            /**
             * In case of the @import statement:
             * 1. Update `hasBreakpointsImport` if breakpoints import if found.
             * 2. Remove all other @import statements.
             */
            if (name === 'import') {
                const isBreakpointImport = params.includes(breakpointsImportPath)

                if (isBreakpointImport) {
                    hasBreakpointsImport = true
                } else {
                    // To avoid resetting `raws` which changes line-breaks — use `Container.removeChild()`
                    // https://github.com/postcss/postcss/blob/75966a9d069be54c997d8b40358342e23bb81328/lib/root.js#L18
                    Container.prototype.removeChild.call(atRule.parent, atRule)
                }
            }

            /**
             * In case of the @media rule:
             * Add breakpoints import statement to the file if it's not yet added.
             */
            if (name === 'media' && !hasBreakpointsImport) {
                atRule.root().prepend(`@import '${breakpointsImportPath}';`)
                hasBreakpointsImport = true
            }
        },
    }
}
