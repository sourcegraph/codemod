import { Node, printNode } from 'ts-morph'

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
    getJsxAttributeStringValue,
    removeJsxAttribute,
} from '@sourcegraph/codemod-toolkit-ts'

import { validateCodemodTarget, validateCodemodTargetOrThrow } from './validateCodemodTarget'

/**
 * Convert `<input class="form-control" />` element to the `<Input />` component.
 */
export const inputToComponent = runTransform(context => {
    const { throwManualChangeError, addManualChangeLog } = context

    const jsxTagElementsToUpdate = new Set<JsxTagElement>()

    return {
        JsxSelfClosingElement(jsxTagElement) {
            if (validateCodemodTarget.JsxTagElement(jsxTagElement)) {
                jsxTagElementsToUpdate.add(jsxTagElement)
            }
        },
        StringLiteral(stringLiteral) {
            const { classNameMappings } = validateCodemodTargetOrThrow.StringLiteral(stringLiteral)
            const jsxAttribute = getParentUntilOrThrow(stringLiteral, Node.isJsxAttribute)

            if (!/classname/i.test(jsxAttribute.getName())) {
                return
            }

            const jsxTagElement = getParentUntilOrThrow(jsxAttribute, isJsxTagElement)

            if (!validateCodemodTarget.JsxTagElement(jsxTagElement)) {
                throwManualChangeError({
                    node: jsxTagElement,
                    message: `Class '${stringLiteral.getLiteralText()}' is used on the '${getTagName(
                        jsxTagElement
                    )}' element. Please update it manually.`,
                })
            }

            for (const { className, props } of classNameMappings) {
                const { isRemoved, manualChangeLog } = removeClassNameAndUpdateJsxElement(stringLiteral, className)

                if (manualChangeLog) {
                    addManualChangeLog(manualChangeLog)
                }

                if (isRemoved) {
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
                if (getJsxAttributeStringValue(jsxTagElement, 'type') === 'text') {
                    removeJsxAttribute(jsxTagElement, 'type')
                }

                setOnJsxTagElement(jsxTagElement, { name: 'Input' })
            }

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: ['Input'],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})
