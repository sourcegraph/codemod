import camelcase from 'camelcase'
import CssModuleLoaderCore, { Source } from 'css-modules-loader-core'
import postcssNested from 'postcss-nested'

import { createCssProcessor } from './createCssProcessor'
import { getPrefixesToRemove, removePrefixFromExportNameIfNeeded } from './exportNameMapPrefixes'

const EXPORT_NAME_PREFIX = 'prefix'

// The simplest subset of logic used by css-modules loaders and processors.
const cssModulesLoaderCore = new CssModuleLoaderCore()
const noOpPathFetcher = (): void => {}
const sourceCssToClassNames = (source: Source): Promise<Core.Result> => {
    return cssModulesLoaderCore.load(source, EXPORT_NAME_PREFIX, undefined, noOpPathFetcher)
}

const removeCssNestingProcessor = createCssProcessor(postcssNested)

/**
 * Get a mapping between export names that will be used in the TS file and CSS classes.
 */
export async function getCssModuleExportNameMap(sourceCss: string): Promise<Record<string, string>> {
    const flattenedResult = await removeCssNestingProcessor(sourceCss)
    const classNames = await sourceCssToClassNames(flattenedResult.css)

    const exportNameClassNamePairs: [string, string][] = Object.entries(classNames.exportTokens).map(
        ([exportName, className]) => {
            const classNameWithoutExportPrefix = className.replace(`_${EXPORT_NAME_PREFIX}__`, '')

            return [classNameWithoutExportPrefix, camelcase(exportName)]
        }
    )

    /**
     * Initial export name map without removed nesting of the selectors:
     *
     * ```scss
     * .menu {
     *     &__button {}
     * }
     * ```
     *
     * Export name map:
     *
     * ```ts
     * {
     *     menu: 'menu',
     *     menu__button: 'menuButton'
     * }
     * ```
     */
    const initialExportNameMap = Object.fromEntries<string>(exportNameClassNamePairs)
    const prefixesToRemove = getPrefixesToRemove(initialExportNameMap)

    const exportNameMapPairs: [string, string][] = Object.entries(initialExportNameMap).map(
        ([className, exportName]) => {
            const exportNameWithoutPrefix = removePrefixFromExportNameIfNeeded({
                className,
                exportName,
                prefixesToRemove,
            })

            return [className, exportNameWithoutPrefix]
        }
    )

    /**
     * Export name map _with_ removed nesting of the selectors:
     *
     * ```scss
     * .menu {
     *     &__button {}
     * }
     * ```
     *
     * Export name map:
     *
     * ```ts
     * {
     *     menu: 'menu',
     *     menu__button: 'button'
     * }
     * ```
     */
    return Object.fromEntries<string>(exportNameMapPairs)
}
