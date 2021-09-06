import signale from 'signale'
import { Project, SyntaxKind } from 'ts-morph'

import { formatWithPrettierEslint } from '../../utils'
import { addClassNamesUtilImportIfNeeded } from '../../utils/classNamesUtility'

import { getTemplateExpressionReplacement } from './getTemplateExpressionReplacement'

interface ClassNameTemplateToClassnamesCallOptions {
    project: Project
    /** If `true` persist changes made by the codemod to the filesystem. */
    shouldWriteFiles?: boolean
}

interface CodemodResult {
    ts: {
        source: string
        path: string
    }
    fsWritePromise?: Promise<void>
}

/**
 * Convert template strings usage in `className` props to `classNames()` utility call
 *
 * className={`repo-header ${className}`} -> className={classNames('repo-header', className)}
 */
export async function classNameTemplateToClassnamesCall(
    options: ClassNameTemplateToClassnamesCallOptions
): Promise<CodemodResult[] | false> {
    const { project, shouldWriteFiles } = options

    const codemodResultPromises = project.getSourceFiles().map(tsSourceFile => {
        const tsFilePath = tsSourceFile.getFilePath()

        signale.info(`Processing file "${tsFilePath}"`)

        const jsxAttributes = tsSourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)
        const classNameJsxAttributes = jsxAttributes.filter(identifier => identifier.getName() === 'className')

        const classNameTemplateExpressions = classNameJsxAttributes.flatMap(classNameJsxAttribute =>
            classNameJsxAttribute.getDescendantsOfKind(SyntaxKind.TemplateExpression)
        )

        for (const templateExpression of classNameTemplateExpressions) {
            try {
                templateExpression.transform(() => getTemplateExpressionReplacement(templateExpression))
            } catch (error) {
                console.error(error)
            }
        }

        addClassNamesUtilImportIfNeeded(tsSourceFile)
        formatWithPrettierEslint(tsSourceFile)

        return {
            ts: {
                source: tsSourceFile.getFullText(),
                path: tsSourceFile.getFilePath(),
            },
            fsWritePromise: shouldWriteFiles ? tsSourceFile.save() : undefined,
        }
    })

    const codemodResults = await Promise.all(codemodResultPromises)

    if (shouldWriteFiles) {
        signale.info('Persisting codemod changes to the filesystem...')
        await Promise.all(codemodResults.map(result => result.fsWritePromise))
    }

    return codemodResults
}
