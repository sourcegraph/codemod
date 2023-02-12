import path from 'path'

import signale from 'signale'

import { Codemod } from '@sourcegraph/codemod-cli'
import { isDefined } from '@sourcegraph/codemod-common'
import { formatWithStylelint } from '@sourcegraph/codemod-toolkit-css'
import { utilities } from '@sourcegraph/codemod-toolkit-packages'
import { formatWithPrettierEslint } from '@sourcegraph/codemod-toolkit-ts'

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
export const globalCssToCssModule: Codemod = context => {
    const { project, shouldWriteFiles, shouldFormat, classname } = context
    const fs = project.getFileSystem()

    /**
     * Find `.tsx` files with co-located `.scss` file.
     * For example `RepoHeader.tsx` should have matching `RepoHeader.scss` in the same folder.
     */
    const itemsToProcess = project
        .getSourceFiles()
        .map(tsSourceFile => {
            const tsFilePath = tsSourceFile.getFilePath()

            const parsedTsFilePath = path.parse(tsFilePath)

            if (parsedTsFilePath.ext !== '.tsx') {
                return
            }

            const cssFilePath = path.resolve(parsedTsFilePath.dir, `${parsedTsFilePath.name}.scss`)

            if (fs.fileExistsSync(cssFilePath)) {
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

        return Promise.resolve([])
    }

    const codemodResultPromises = itemsToProcess.map(async ({ tsSourceFile, cssFilePath }) => {
        const tsFilePath = tsSourceFile.getFilePath()
        const parsedTsFilePath = path.parse(tsFilePath)

        signale.info(`Processing file "${tsFilePath}"`)

        const sourceCss = fs.readFileSync(cssFilePath, 'utf8')
        const exportNameMap = await getCssModuleExportNameMap(sourceCss)
        const { css: cssModuleSource, filePath: cssModuleFileName } = await transformFileToCssModule({
            sourceCss,
            sourceFilePath: cssFilePath,
        })

        transformComponentFile({ tsSourceFile, exportNameMap, cssModuleFileName, classname })

        utilities[classname].importer(tsSourceFile)

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
                  fs.writeFile(cssModuleFileName, formattedCssModuleSource),
                  fs.delete(cssFilePath),
              ])
            : undefined

        return {
            target: tsSourceFile,
            manualChangesReported: {},
            fsWritePromise,
            files: [
                {
                    source: formattedCssModuleSource,
                    path: path.resolve(parsedTsFilePath.dir, cssModuleFileName),
                },
                {
                    source: tsSourceFile.getFullText(),
                    path: tsSourceFile.getFilePath(),
                },
            ],
        }
    })

    return Promise.all(codemodResultPromises)
}
