import camelcase from 'camelcase'
import CssModuleLoaderCore, { Source } from 'css-modules-loader-core'
import postcssNested from 'postcss-nested'

import { createCssProcessor } from './createCssProcessor'

const EXPORT_NAME_PREFIX = 'prefix'

// The simplest subset of logic used by css-modules loaders and processors.
const cssModulesLoaderCore = new CssModuleLoaderCore()
const noOpPathFetcher = (): void => {}
const sourceCssToClassNames = (source: Source): Promise<Core.Result> =>
    cssModulesLoaderCore.load(source, EXPORT_NAME_PREFIX, undefined, noOpPathFetcher)

const removeCssNestingProcessor = createCssProcessor(postcssNested)

// Get a mapping between export names that will be used in the TS file and CSS classes.
export async function getCssModuleExportNameMap(sourceCss: string): Promise<Record<string, string>> {
    const flattenedResult = await removeCssNestingProcessor(sourceCss)
    const classNames = await sourceCssToClassNames(flattenedResult.css)

    const exportNameClassNamePairs: [string, string][] = Object.entries(classNames.exportTokens).map(
        ([property, className]) => [className.replace(`_${EXPORT_NAME_PREFIX}__`, ''), camelcase(property)]
    )

    return Object.fromEntries<string>(exportNameClassNamePairs)
}
