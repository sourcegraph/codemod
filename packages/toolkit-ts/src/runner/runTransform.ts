import signale from 'signale'
import { SourceFile } from 'ts-morph'

import { Codemod, CodemodResult, CodemodContext, CodemodResultFile, TransformOptions } from '@sourcegraph/codemod-cli'
import { ManualChangeList, createManualChangeList } from '@sourcegraph/codemod-common'

import { formatWithPrettierEslint } from '../formatters'

import { visitor, VisitorHandlers } from './visitor'

export interface TransformContext<T> extends CodemodContext<T>, ManualChangeList {
    sourceFile: SourceFile
}

/**
 * If multiple files need to be transformed, a visitor pattern
 * applied to a single file is not sufficient. In this case,
 * the modified files must be formatted within the transform function.
 */
export interface CustomTransformReturn {
    files: CodemodResultFile[]
    writeFiles?(this: void): Promise<unknown>
}

export type TransformReturn = VisitorHandlers | CustomTransformReturn | void

export type Transform<T extends TransformOptions = TransformOptions> = (
    transformContext: TransformContext<T>
) => Promise<TransformReturn> | TransformReturn

/**
 * Typescript transform runner. Responsible for:
 *
 * 1. Going through source files.
 * 2. Adding source file to the `CodemodContext` and passing it to the transform function.
 * 3. Running `visitor` function if the result of the transform function is `VisitorHandlers`.
 * 4. Returning `CodemodResult` to the caller.
 */
export function runTransform<T extends TransformOptions = TransformOptions>(transform: Transform<T>): Codemod<T> {
    return function codemod(codemodContext) {
        const { project, shouldWriteFiles, shouldFormat } = codemodContext

        const codemodResultPromises = project.getSourceFiles().map(async sourceFile => {
            signale.info(`Processing file "${sourceFile.getFilePath()}"`)

            const manualChangeList = createManualChangeList()
            const transformContext = { sourceFile, ...codemodContext, ...manualChangeList }

            const transformResult = await transform(transformContext)
            const transformResultCommon: Pick<CodemodResult, 'target' | 'manualChangesReported'> = {
                target: sourceFile,
                manualChangesReported: manualChangeList.manualChangesReported,
            }

            // Handle `CustomTransformReturn` where multiple files can be changed.
            if (transformResult && isCustomTransformResult(transformResult)) {
                const { files, writeFiles } = transformResult

                return {
                    files,
                    fsWritePromise: shouldWriteFiles && writeFiles ? writeFiles() : undefined,
                    ...transformResultCommon,
                }
            }

            // Handle `VisitorHandlers` return that transforms and formats one source file.
            if (transformResult) {
                visitor(transformContext, transformResult)

                // TODO: run format only if the file is changed.
                if (shouldFormat) {
                    formatWithPrettierEslint(sourceFile)
                }

                return {
                    files: [
                        {
                            source: sourceFile.getFullText(),
                            path: sourceFile.getFilePath(),
                        },
                    ],
                    fsWritePromise: shouldWriteFiles ? Promise.all([sourceFile.save()]) : undefined,
                    ...transformResultCommon,
                }
            }

            return transformResultCommon
        })

        return Promise.all(codemodResultPromises)
    }
}

function isCustomTransformResult(result: VisitorHandlers | CustomTransformReturn): result is CustomTransformReturn {
    return 'files' in result
}
