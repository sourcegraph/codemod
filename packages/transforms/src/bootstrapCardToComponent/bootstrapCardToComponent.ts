import { Node, printNode } from 'ts-morph'

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

import { validateCodemodTarget, validateCodemodTargetOrThrow, BANNED_TAG_NAME } from './validateCodemodTarget'

interface ButtonElementToComponentOptions {
    /* 'Link', 'MenuItem', 'MenuButton', 'LoaderButton', 'label', 'a', 'div'*/
    tagToConvert: string
}

/**
 * Convert `<button class="btn-primary" />` element to the `<Button variant="primary" />` component.
 */
export const bootstrapCardToComponent = runTransform<ButtonElementToComponentOptions>(context => {
    const { transformOptions, throwManualChangeError, addManualChangeLog } = context
    const tagToConvert = transformOptions?.tagToConvert || BANNED_TAG_NAME

    const jsxTagElementsToUpdate = new Set<JsxTagElement>()

    return {
        /**
         * 1. Check if `StringLiteral` contains button classes.
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
                if (tagToConvert !== BANNED_TAG_NAME) {
                    addAsJsxAttribute(jsxTagElement, tagToConvert)
                }

                setOnJsxTagElement(jsxTagElement, { name: 'Card' })
            }

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: ['Card'],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})
