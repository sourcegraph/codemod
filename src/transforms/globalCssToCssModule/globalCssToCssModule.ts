import { readFileSync } from 'fs'
import path from 'path'

import { Project } from 'ts-morph'

import { getCssModuleExportNameMap } from './postcss/getCssModuleExportNameMap'
import { transformFileToCssModule } from './postcss/transformFileToCssModule'
import { addClassNamesUtilImportIfNeeded } from './ts/classNamesUtility'
import { getNodesWithClassName } from './ts/getNodesWithClassName'
import { STYLES_IDENTIFIER, processNodesWithClassName } from './ts/processNodesWithClassName'

interface CodemodResult {
    css: {
        source: string
        path: string
    }
    ts: {
        source: string
        path: string
    }
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
export function globalCssToCssModule(project: Project): Promise<CodemodResult[]> {
    const codemodResults = project.getSourceFiles().map(async sourceFile => {
        const filePath = sourceFile.getFilePath()

        const parsedTsFilePath = path.parse(filePath)
        const cssFilePath = path.resolve(parsedTsFilePath.dir, `${parsedTsFilePath.name}.scss`)

        // TODO: add check if SCSS file doesn't exist and exit if it's not found.
        const sourceCss = readFileSync(cssFilePath, 'utf8')
        const exportNameMap = await getCssModuleExportNameMap(sourceCss)
        const { css: cssModuleSource, filePath: cssModuleFileName } = await transformFileToCssModule(
            sourceCss,
            cssFilePath
        )

        processNodesWithClassName({
            exportNameMap,
            nodesWithClassName: getNodesWithClassName(sourceFile),
        })

        addClassNamesUtilImportIfNeeded(sourceFile)
        sourceFile.addImportDeclaration({
            defaultImport: STYLES_IDENTIFIER,
            moduleSpecifier: `./${path.parse(cssModuleFileName).base}`,
        })

        // TODO: run prettier and eslint --fix over updated files.
        return {
            css: {
                source: cssModuleSource,
                path: path.resolve(parsedTsFilePath.dir, cssModuleFileName),
            },
            ts: {
                source: sourceFile.getFullText(),
                path: sourceFile.getFilePath(),
            },
        }
    })

    return Promise.all(codemodResults)
}
