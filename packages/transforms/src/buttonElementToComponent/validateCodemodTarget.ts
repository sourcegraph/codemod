import { JsxAttribute, Node, StringLiteral } from 'ts-morph'

import { throwFromMethodsIfUndefinedReturn } from '@sourcegraph/codemod-common'
import { getClassNameRegExp, getParentUntilOrThrow, JsxTagElement } from '@sourcegraph/codemod-toolkit-ts'

import { buttonClassNamesMapping, ClassNameMapping } from './buttonClassNamesMapping'

interface StringLiteralValidatorResult {
    stringLiteral: StringLiteral
    classNameMappings: ClassNameMapping[]
    jsxAttribute: JsxAttribute
}

export const DEFAULT_ELEMENT_TO_CONVERT = 'button'

// Used in corresponding eslint-rule.
export const validateCodemodTarget = {
    /**
     * Returns `JsxTagElement` is tag name matches, 'button' by default.
     */
    JsxTagElement(jsxTagElement: JsxTagElement, tagName = DEFAULT_ELEMENT_TO_CONVERT): JsxTagElement | void {
        if (jsxTagElement.getTagNameNode().getText() === tagName) {
            return jsxTagElement
        }
    },
    /**
     * Returns non-void result if received `StringLiteral`:
     * 1. Has one of button classes like `btn-primary`.
     * 2. Has `JsxAttribute` ancestor with `classname` in the attribute name.
     */
    StringLiteral(stringLiteral: StringLiteral): StringLiteralValidatorResult | void {
        const classNameMappings = buttonClassNamesMapping.filter(({ className }) => {
            return getClassNameRegExp(className).test(stringLiteral.getLiteralValue())
        })

        if (classNameMappings.length !== 0) {
            const jsxAttribute = getParentUntilOrThrow(stringLiteral, Node.isJsxAttribute)

            if (/classname/i.test(jsxAttribute.getName())) {
                return { stringLiteral, classNameMappings, jsxAttribute }
            }
        }
    },
}

export const validateCodemodTargetOrThrow = throwFromMethodsIfUndefinedReturn(validateCodemodTarget)
