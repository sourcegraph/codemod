import { StringLiteral } from 'ts-morph'

import { throwFromMethodsIfUndefinedReturn } from '@sourcegraph/codemod-common'
import { JsxTagElement } from '@sourcegraph/codemod-toolkit-ts'

import { alertClassNamesMapping, ClassNameMapping } from './alertClassNamesMapping'

interface StringLiteralValidatorResult {
    stringLiteral: StringLiteral
    classNameMappings: ClassNameMapping[]
}

interface JsxTagElementValidatorResult {
    jsxTagElement: JsxTagElement
    tagName: string
}

// Used in `use-button-component` eslint-rule.
export const validateCodemodTarget = {
    /**
     * Returns `JsxTagElement` if tag name matches.
     */
    JsxTagElement(jsxTagElement: JsxTagElement, bannedTagName = 'div'): JsxTagElementValidatorResult | void {
        const tagName = jsxTagElement.getTagNameNode().getText()

        if (tagName === bannedTagName) {
            return { jsxTagElement, tagName }
        }
    },
    /**
     * Returns non-void result if received `StringLiteral` has one of button classes like `btn-primary`.
     */
    StringLiteral(stringLiteral: StringLiteral): StringLiteralValidatorResult | void {
        const classNameMappings = alertClassNamesMapping.filter(({ className }) => {
            return stringLiteral
                .getLiteralValue()
                .split(' ')
                .some(word => {
                    return word === className
                })
        })

        if (classNameMappings.length !== 0) {
            return { classNameMappings, stringLiteral }
        }
    },
}

export const validateCodemodTargetOrThrow = throwFromMethodsIfUndefinedReturn(validateCodemodTarget)
