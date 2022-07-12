import { StringLiteral } from 'ts-morph'

import { throwFromMethodsIfUndefinedReturn } from '@sourcegraph/codemod-common'
import { JsxTagElement } from '@sourcegraph/codemod-toolkit-ts'

import { cardClassNameMapping, ClassNameMapping } from './cardClassNamesMapping'

interface StringLiteralValidatorResult {
    stringLiteral: StringLiteral
    classNameMappings: ClassNameMapping[]
}

interface JsxTagElementValidatorResult {
    jsxTagElement: JsxTagElement
    tagName: string
}

export const BANNED_TAG_NAME = 'div'

// Used in `use-button-component` eslint-rule.
export const validateCodemodTarget = {
    /**
     * Returns `JsxTagElement` if tag name matches.
     */
    JsxTagElement(jsxTagElement: JsxTagElement, bannedTagName = BANNED_TAG_NAME): JsxTagElementValidatorResult | void {
        const tagName = jsxTagElement.getTagNameNode().getText()

        if (tagName === bannedTagName) {
            return { jsxTagElement, tagName }
        }
    },
    /**
     * Returns non-void result if received `StringLiteral` has one of button classes like `btn-primary`.
     */
    StringLiteral(stringLiteral: StringLiteral): StringLiteralValidatorResult | void {
        const classNameMappings = cardClassNameMapping.filter(({ className }) => {
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
