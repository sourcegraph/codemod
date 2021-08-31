import { existsSync, readFileSync, promises as fsPromises } from 'fs'
import path from 'path'

import { Project } from 'ts-morph'

import { isDefined } from '../../utils'

import { getCssModuleExportNameMap } from './postcss/getCssModuleExportNameMap'
import { transformFileToCssModule } from './postcss/transformFileToCssModule'
import { addClassNamesUtilImportIfNeeded } from './ts/classNamesUtility'
import { getNodesWithClassName } from './ts/getNodesWithClassName'
import { STYLES_IDENTIFIER, processNodesWithClassName } from './ts/processNodesWithClassName'

interface GlobalCssToCssModuleOptions {
    project: Project
    shouldWriteFiles?: boolean
}

interface CodemodResult {
    css: {
        source: string
        path: string
    }
    ts: {
        source: string
        path: string
    }
    writePromise?: Promise<void[]>
}

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
export async function globalCssToCssModule(options: GlobalCssToCssModuleOptions): Promise<CodemodResult[]> {
    const { project, shouldWriteFiles } = options
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

    const codemodResults = itemsToProcess.map(async ({ tsSourceFile, cssFilePath }) => {
        const tsFilePath = tsSourceFile.getFilePath()
        const parsedTsFilePath = path.parse(tsFilePath)

        const sourceCss = readFileSync(cssFilePath, 'utf8')
        const { css: cssModuleSource, filePath: cssModuleFileName } = await transformFileToCssModule({
            sourceCss,
            sourceFilePath: cssFilePath,
        })
        const exportNameMap = await getCssModuleExportNameMap(cssModuleSource)

        processNodesWithClassName({
            exportNameMap,
            nodesWithClassName: getNodesWithClassName(tsSourceFile),
        })

        addClassNamesUtilImportIfNeeded(tsSourceFile)
        tsSourceFile.addImportDeclaration({
            defaultImport: STYLES_IDENTIFIER,
            moduleSpecifier: `./${path.parse(cssModuleFileName).base}`,
        })

        // TODO: run prettier and eslint --fix over updated files.
        const result: CodemodResult = {
            css: {
                source: cssModuleSource,
                path: path.resolve(parsedTsFilePath.dir, cssModuleFileName),
            },
            ts: {
                source: tsSourceFile.getFullText(),
                path: tsSourceFile.getFilePath(),
            },
        }

        if (shouldWriteFiles) {
            result.writePromise = Promise.all([
                tsSourceFile.save(),
                fsPromises.writeFile(cssModuleFileName, cssModuleSource, { encoding: 'utf-8' }),
            ])
        }

        return result
    })

    const results = await Promise.all(codemodResults)

    if (shouldWriteFiles) {
        await Promise.all(results.map(result => result.writePromise))
    }

    return results
}
