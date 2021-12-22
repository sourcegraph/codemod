import signale from 'signale'
import { SyntaxKind } from 'ts-morph'

import { CodemodResult, CodemodOptions } from '../../types'
import { formatWithPrettierEslint } from '../../utils'
import { addClassNamesUtilImportIfNeeded } from '../../utils/classNamesUtility'

import { getTemplateExpressionReplacement } from './getTemplateExpressionReplacement'

/**
 * Convert template strings usage in `className` props to `classNames()` utility call
 *
 * className={`repo-header ${className}`} -> className={classNames('repo-header', className)}
 */
export async function classNameTemplateToClassnamesCall(options: CodemodOptions): CodemodResult {
    const { project, shouldWriteFiles } = options

    const codemodResultPromises = project.getSourceFiles().map(tsSourceFile => {
        const tsFilePath = tsSourceFile.getFilePath()

        signale.info(`Processing file "${tsFilePath}"`)

        const jsxAttributes = tsSourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)
        const classNameJsxAttributes = jsxAttributes.filter(identifier => {
            return identifier.getName() === 'className'
        })

        const classNameTemplateExpressions = classNameJsxAttributes.flatMap(classNameJsxAttribute => {
            return classNameJsxAttribute.getDescendantsOfKind(SyntaxKind.TemplateExpression)
        })

        for (const templateExpression of classNameTemplateExpressions) {
            try {
                templateExpression.transform(() => {
                    return getTemplateExpressionReplacement(templateExpression)
                })
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
            fsWritePromise: shouldWriteFiles ? Promise.all([tsSourceFile.save()]) : undefined,
        }
    })

    return Promise.all(codemodResultPromises)
}
