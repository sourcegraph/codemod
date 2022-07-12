import path from 'path'

import signale from 'signale'
import { NoSubstitutionTemplateLiteral, SyntaxKind } from 'ts-morph'

import { CodemodOptions, CodemodResult } from '../../types'
import { formatWithPrettierEslint } from '../../utils'

export function gqlStringToGraphQLFile(options: CodemodOptions): CodemodResult {
    const { project, shouldWriteFiles } = options

    const codemodResultPromises = project.getSourceFiles().map(tsSourceFile => {
        const tsFilePath = tsSourceFile.getFilePath()
        const { dir, name } = path.parse(tsFilePath)
        const graphqlFilePath = path.resolve(dir, `${name}.graphql`)
        const generatedFilePath = path.resolve(dir, `${name}.queries`)

        signale.info(`Processing file "${tsFilePath}"`)

        const templateStrings = tsSourceFile.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression)
        const gqlStrings = templateStrings.filter(identifer => identifer.getTag().getText() === 'gql')

        if (gqlStrings.length === 0) {
            return
        }

        const graphqlOperations: string[] = []
        const documentsToImport: string[] = []

        for (const gqlString of gqlStrings) {
            const templateLiteral = gqlString.removeTag()

            const operation =
                templateLiteral instanceof NoSubstitutionTemplateLiteral
                    ? templateLiteral.compilerNode.rawText
                    : templateLiteral.getHead().compilerNode.rawText

            graphqlOperations.push(operation)

            const queryName = operation.match(/^\s*(?:query|mutation)\s+(\w+)/)?.[1]
            const fragmentName = operation.match(/^\s*fragment\s+(\w+)/)?.[1]
            const generatedOperation = queryName && `${queryName}Document`
            const importName = generatedOperation || fragmentName || 'ANONYMOUS_OPERATION_REPLACE_ME'

            // Replace the old literal with a future import
            templateLiteral.replaceWithText(importName)

            // Store so we can import later
            documentsToImport.push(importName)
        }

        const existingImports =
            tsSourceFile
                .getImportDeclaration(fileImport =>
                    fileImport.getModuleSpecifierValue().endsWith('./graphql-operations')
                )
                ?.getNamedImports() ?? []

        for (const namedImport of existingImports) {
            if (documentsToImport.includes(namedImport.getNameNode().getText())) {
                namedImport.remove()
            }
        }

        tsSourceFile.addImportDeclaration({
            namedImports: documentsToImport,
            moduleSpecifier: `./${path.parse(generatedFilePath).base}`,
        })

        formatWithPrettierEslint(tsSourceFile)

        const graphqlSourceFile = project.createSourceFile(graphqlFilePath, graphqlOperations.join('\n'))
        formatWithPrettierEslint(graphqlSourceFile)

        return {
            ts: {
                source: graphqlSourceFile.getFullText(),
                path: graphqlSourceFile.getFilePath(),
            },
            fsWritePromise: shouldWriteFiles ? Promise.all([graphqlSourceFile.save(), tsSourceFile.save()]) : undefined,
        }
    })

    return Promise.all(codemodResultPromises)
}
