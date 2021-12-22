import { existsSync, readFileSync, promises as fsPromises } from 'fs'
import path from 'path'

import signale from 'signale'

import { CodemodResult, CodemodOptions } from '../../types'
import { formatWithPrettierEslint, formatWithStylelint, isDefined } from '../../utils'
import { addClassNamesUtilImportIfNeeded } from '../../utils/classNamesUtility'

import { getCssModuleExportNameMap } from './postcss/getCssModuleExportNameMap'
import { transformFileToCssModule } from './postcss/transformFileToCssModule'
import { STYLES_IDENTIFIER } from './ts/processNodesWithClassName'
import { transformComponentFile } from './ts/transformComponentFile'

/**
 * Convert globally scoped stylesheet tied to the React component into a CSS Module.
 *
 * 1) Find `.tsx` file.
 * 2) Check if corresponding `.scss` file exists in the same folder.
 * 3) Convert this `.scss` file into `.module.scss`.
 * 4) Get info about CSS class names and matching export tokens.
 * 5) Replace all matching class names with export tokens.
 * 6) Add `classNames` import to the `.tsx` file if needed.
 * 7) Add `.module.scss` import to the `.tsx` file.
 *
 */
export async function globalCssToCssModule(options: CodemodOptions): CodemodResult {
    const { project, shouldWriteFiles, shouldFormat } = options
    /**
     * Find `.tsx` files with co-located `.scss` file.
     * For example `RepoHeader.tsx` should have matching `RepoHeader.scss` in the same folder.
     */
    const itemsToProcess = project
        .getSourceFiles()
        .map(tsSourceFile => {
            const tsFilePath = tsSourceFile.getFilePath()

            const parsedTsFilePath = path.parse(tsFilePath)
            const cssFilePath = path.resolve(parsedTsFilePath.dir, `${parsedTsFilePath.name}.scss`)

            if (existsSync(cssFilePath)) {
                return {
                    tsSourceFile,
                    cssFilePath,
                }
            }

            return undefined
        })
        .filter(isDefined)

    if (itemsToProcess.length === 0) {
        signale.warn('No files to process!')

        return false
    }

    const codemodResultPromises = itemsToProcess.map(async ({ tsSourceFile, cssFilePath }) => {
        const tsFilePath = tsSourceFile.getFilePath()
        const parsedTsFilePath = path.parse(tsFilePath)

        signale.info(`Processing file "${tsFilePath}"`)

        const sourceCss = readFileSync(cssFilePath, 'utf8')
        const exportNameMap = await getCssModuleExportNameMap(sourceCss)
        const { css: cssModuleSource, filePath: cssModuleFileName } = await transformFileToCssModule({
            sourceCss,
            sourceFilePath: cssFilePath,
        })

        transformComponentFile({ tsSourceFile, exportNameMap, cssModuleFileName })
        addClassNamesUtilImportIfNeeded(tsSourceFile)
        tsSourceFile.addImportDeclaration({
            defaultImport: STYLES_IDENTIFIER,
            moduleSpecifier: `./${path.parse(cssModuleFileName).base}`,
        })

        if (shouldFormat) {
            formatWithPrettierEslint(tsSourceFile)
        }
        const formattedCssModuleSource = await formatWithStylelint(cssModuleSource, cssFilePath)

        /**
         * If `shouldWriteFiles` is true:
         *
         * 1. Update TS file with a new source that uses CSS module.
         * 2. Create a new CSS module file.
         * 3. Delete redundant SCSS file that's replaced with CSS module.
         */
        const fsWritePromise = shouldWriteFiles
            ? Promise.all([
                  tsSourceFile.save(),
                  fsPromises.writeFile(cssModuleFileName, formattedCssModuleSource, { encoding: 'utf-8' }),
                  fsPromises.rm(cssFilePath),
              ])
            : undefined

        return {
            fsWritePromise,
            css: {
                source: formattedCssModuleSource,
                path: path.resolve(parsedTsFilePath.dir, cssModuleFileName),
            },
            ts: {
                source: tsSourceFile.getFullText(),
                path: tsSourceFile.getFilePath(),
            },
        }
    })

    return Promise.all(codemodResultPromises)
}
