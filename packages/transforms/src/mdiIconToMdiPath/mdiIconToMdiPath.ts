import { Node, printNode, ts } from 'ts-morph'

import {
    removeClassNameAndUpdateJsxElement,
    addOrUpdateSourcegraphWildcardImportIfNeeded,
} from '@sourcegraph/codemod-toolkit-packages'
import {
    runTransform,
    getParentUntilOrThrow,
    isJsxTagElement,
    getTagName,
    JsxTagElement,
    setOnJsxTagElement,
} from '@sourcegraph/codemod-toolkit-ts'

import { validateCodemodTargetOrThrow } from './validateCodemodTarget'

/**
 * Convert `<Icon as={MdiIcon} />` element to `<Icon svgPath={mdiIconPath} />` component.
 */
export const mdiIconToMdiPath = runTransform(context => {
    const { throwManualChangeError, addManualChangeLog } = context

    const jsxTagElementsToUpdate = new Set<JsxTagElement>()

    return {
        StringLiteral(stringLiteral) {
            const { classNameMappings } = validateCodemodTargetOrThrow.StringLiteral(stringLiteral)
            const jsxAttribute = getParentUntilOrThrow(stringLiteral, Node.isJsxAttribute)

            const jsxTagElement = getParentUntilOrThrow(jsxAttribute, isJsxTagElement)

            for (const { className, props } of classNameMappings) {
                const { isRemoved, manualChangeLog } = removeClassNameAndUpdateJsxElement(stringLiteral, className)

                if (manualChangeLog) {
                    addManualChangeLog(manualChangeLog)
                }

                if (isRemoved) {
                    jsxTagElement.addAttribute({
                        name: 'as',
                        initializer: printNode(
                            ts.factory.createJsxExpression(
                                undefined,
                                ts.factory.createIdentifier(getTagName(jsxTagElement))
                            )
                        ),
                    })

                    for (const { name, value } of props) {
                        jsxTagElement.addAttribute({
                            name,
                            initializer: printNode(value),
                        })
                    }
                }
            }

            jsxTagElementsToUpdate.add(jsxTagElement)
        },
        SourceFileExit(sourceFile) {
            if (jsxTagElementsToUpdate.size === 0) {
                return
            }

            for (const jsxTagElement of jsxTagElementsToUpdate) {
                if (Node.isJsxSelfClosingElement(jsxTagElement)) {
                    setOnJsxTagElement(jsxTagElement, { name: 'Icon' })
                }
            }

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: ['Icon'],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})
