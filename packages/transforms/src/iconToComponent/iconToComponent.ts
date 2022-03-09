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

import { validateCodemodTarget, validateCodemodTargetOrThrow } from './validateCodemodTarget'

interface IconToComponentOptions {
    tagToConvert: string
}

/**
 * Convert `<SomeIcon class="icon-inline" />` element to the `<Icon svg={<SomeIcon />} />` component.
 */
export const iconToComponent = runTransform<IconToComponentOptions>(context => {
    const { throwManualChangeError, addManualChangeLog } = context

    const jsxTagElementsToUpdate = new Set<JsxTagElement>()

    return {
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
