import signale from 'signale'
import { SyntaxKind } from 'ts-morph'

import { Codemod } from '@sourcegraph/codemod-cli'
import { addClassNamesUtilImportIfNeeded } from '@sourcegraph/codemod-toolkit-packages'
import { formatWithPrettierEslint } from '@sourcegraph/codemod-toolkit-ts'

import { getTemplateExpressionReplacement } from './getTemplateExpressionReplacement'

/**
 * Convert template strings usage in `className` props to `classNames()` utility call
 *
 * className={`repo-header ${className}`} -> className={classNames('repo-header', className)}
 */
export const classNameTemplateToClassnamesCall: Codemod = context => {
    const { project, shouldWriteFiles } = context

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
                signale.error(error)
            }
        }

        addClassNamesUtilImportIfNeeded(tsSourceFile)
        formatWithPrettierEslint(tsSourceFile)

        return {
            target: tsSourceFile,
            manualChangesReported: {},
            files: [
                {
                    source: tsSourceFile.getFullText(),
                    path: tsSourceFile.getFilePath(),
                },
            ],
            fsWritePromise: shouldWriteFiles ? Promise.all([tsSourceFile.save()]) : undefined,
        }
    })

    return Promise.all(codemodResultPromises)
}
