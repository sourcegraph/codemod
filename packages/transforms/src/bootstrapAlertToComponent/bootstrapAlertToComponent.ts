import { Node, printNode } from 'ts-morph'

import {
    removeClassNameAndUpdateJsxElement,
    addOrUpdateSourcegraphWildcardImportIfNeeded,
} from '@sourcegraph/codemod-toolkit-packages'
import {
    runTransform,
    getParentUntilOrThrow,
    isJsxTagElement,
    setOnJsxTagElement,
    getTagName,
    JsxTagElement,
    addAsJsxAttribute,
} from '@sourcegraph/codemod-toolkit-ts'

import { validateCodemodTarget, validateCodemodTargetOrThrow } from './validateCodemodTarget'

interface BootstrapAlertToComponentOptions {
    /* 'Link', 'MenuItem', 'MenuButton', 'LoaderButton', 'label', 'a', 'div'*/
    tagToConvert: string
}

/**
 * Convert `<div class="alert alert-primary" />` element to the `<Alert variant="primary" />` component.
 */
export const bootstrapAlertToComponent = runTransform<BootstrapAlertToComponentOptions>(context => {
    const { transformOptions, throwManualChangeError, addManualChangeLog } = context
    const tagToConvert = transformOptions?.tagToConvert || 'div'

    const jsxTagElementsToUpdate = new Set<JsxTagElement>()

    return {
        /**
         * 1. Check if `StringLiteral` contains Alert classes.
         * 2. Remove matching classes from the `StringLiteral`.
         * 3. Add corresponding `JsxAttribute` after removal if needed. E.g., `variant="primary"`.
         * 4. If `StringLiteral` was updated save reference to `JsxTagElement` to update it later.
         */
        StringLiteral(stringLiteral) {
            const { classNameMappings } = validateCodemodTargetOrThrow.StringLiteral(stringLiteral)
            const jsxAttribute = getParentUntilOrThrow(stringLiteral, Node.isJsxAttribute)

            if (!/classname/i.test(jsxAttribute.getName())) {
                return
            }

            const jsxTagElement = getParentUntilOrThrow(jsxAttribute, isJsxTagElement)

            if (!validateCodemodTarget.JsxTagElement(jsxTagElement, tagToConvert)) {
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
        /**
         * 1. Skip if no `JsxTagElement` was changed during transform.
         * 2. Change tag name of the `JsxTagElement` to `Alert`.
         * 3. Add `Alert` import from `@sourcegraph/wildcard` if needed.
         * 4. Remove unused identifiers.
         */
        SourceFileExit(sourceFile) {
            if (jsxTagElementsToUpdate.size === 0) {
                return
            }

            for (const jsxTagElement of jsxTagElementsToUpdate) {
                if (tagToConvert !== 'div') {
                    addAsJsxAttribute(jsxTagElement, tagToConvert)
                }

                setOnJsxTagElement(jsxTagElement, { name: 'Alert' })
            }

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: ['Alert'],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})
