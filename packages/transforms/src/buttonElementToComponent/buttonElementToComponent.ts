import { printNode } from 'ts-morph'

import {
    removeClassNameAndUpdateJsxElement,
    addOrUpdateSourcegraphWildcardImportIfNeeded,
} from '@sourcegraph/codemod-toolkit-packages'
import {
    runTransform,
    removeJsxAttribute,
    getParentUntilOrThrow,
    getJsxAttributeStringValue,
    isJsxTagElement,
    setOnJsxTagElement,
    getTagName,
    JsxTagElement,
    addAsJsxAttribute,
} from '@sourcegraph/codemod-toolkit-ts'

import {
    DEFAULT_ELEMENT_TO_CONVERT,
    validateCodemodTarget,
    validateCodemodTargetOrThrow,
} from './validateCodemodTarget'

interface ButtonElementToComponentOptions {
    /* 'Link', 'MenuItem', 'MenuButton', 'LoaderButton', 'label', 'a', 'div'*/
    tagToConvert: string
}

/**
 * Convert `<button class="btn-primary" />` element to the `<Button variant="primary" />` component.
 */
export const buttonElementToComponent = runTransform<ButtonElementToComponentOptions>(context => {
    const { transformOptions, throwManualChangeError, addManualChangeLog } = context
    const tagToConvert = transformOptions?.tagToConvert || DEFAULT_ELEMENT_TO_CONVERT

    const jsxTagElementsToUpdate = new Set<JsxTagElement>()

    return {
        /**
         * 1. Check if `StringLiteral` contains button classes.
         * 2. Remove matching classes from the `StringLiteral`.
         * 3. Add corresponding `JsxAttribute` after removal if needed. E.g., `variant="primary"`.
         * 4. If `StringLiteral` was updated save reference to `JsxTagElement` to update in later.
         */
        StringLiteral(stringLiteral) {
            const { classNameMappings, jsxAttribute } = validateCodemodTargetOrThrow.StringLiteral(stringLiteral)
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
         * 2. Remove `type="button"` attribute from the mutated `JsxTagElement`.
         * 3. Add `as={Link}` `JsxAttribute` if needed.
         * 4. Change tag name of the `JsxTagElement` to `Button`.
         * 5. Add `Button` import from `@sourcegraph/wildcard` if needed.
         * 6. Remove unused identifiers.
         */
        SourceFileExit(sourceFile) {
            if (jsxTagElementsToUpdate.size === 0) {
                return
            }

            for (const jsxTagElement of jsxTagElementsToUpdate) {
                if (getJsxAttributeStringValue(jsxTagElement, 'type') === 'button') {
                    removeJsxAttribute(jsxTagElement, 'type')
                }

                if (tagToConvert !== DEFAULT_ELEMENT_TO_CONVERT) {
                    addAsJsxAttribute(jsxTagElement, tagToConvert)
                }

                setOnJsxTagElement(jsxTagElement, { name: 'Button' })
            }

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: ['Button'],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})
