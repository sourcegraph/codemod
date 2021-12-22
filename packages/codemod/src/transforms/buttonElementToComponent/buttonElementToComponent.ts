import signale from 'signale'

import { CodemodResult, CodemodOptions } from '../../types'
import { formatWithPrettierEslint } from '../../utils'
import { addClassNamesUtilImportIfNeeded } from '../../utils/classNamesUtility'

/**
 * Convert `<button class="btn-primary" />` element to the `<Button variant="primary" />` component.
 */
export async function buttonElementToComponent(options: CodemodOptions): CodemodResult {
    const { project, shouldWriteFiles } = options

    const codemodResultPromises = project.getSourceFiles().map(tsSourceFile => {
        const tsFilePath = tsSourceFile.getFilePath()

        signale.info(`Processing file "${tsFilePath}"`)

        /* implement transform function here */

        addClassNamesUtilImportIfNeeded(tsSourceFile)
        formatWithPrettierEslint(tsSourceFile)

        return {
            ts: {
                source: tsSourceFile.getFullText(),
                path: tsSourceFile.getFilePath(),
            },
            fsWritePromise: shouldWriteFiles ? Promise.all([tsSourceFile.save()]) : undefined,
        }
    })

    return Promise.all(codemodResultPromises)
}
