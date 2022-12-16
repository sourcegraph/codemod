import { addOrUpdateSourcegraphWildcardImportIfNeeded } from '@sourcegraph/codemod-toolkit-packages'
import { getImportDeclarationByModuleSpecifier, JsxTagElement, runTransform } from '@sourcegraph/codemod-toolkit-ts'

const COMPONENTS_TO_MOVE = new Set(['ErrorMessage', 'ErrorAlert'])

/**
 * Update imports for COMPONENTS_TO_MOVE to `@sourcegraph/wildcard`. See tests for more examples.
 */
export const errorMessageMove = runTransform(() => {
    const jsxTagElementsToUpdate = new Set<string>()

    function processElement(element: JsxTagElement): void {
        const tagName = element.getTagNameNode().getText()

        if (COMPONENTS_TO_MOVE.has(tagName)) {
            jsxTagElementsToUpdate.add(tagName)
        }
    }

    return {
        JsxOpeningElement: processElement,
        JsxSelfClosingElement: processElement,
        SourceFileExit(sourceFile) {
            if (jsxTagElementsToUpdate.size === 0) {
                return
            }
            const declaration = getImportDeclarationByModuleSpecifier(
                sourceFile,
                '@sourcegraph/branded/src/components/alerts'
            )
            declaration?.remove()

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: [...jsxTagElementsToUpdate],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})
