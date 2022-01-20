import { Node, StringLiteral, CallExpression } from 'ts-morph'

import { ManualChangeLog } from '@sourcegraph/codemod-common'
import {
    getParentUntilOrThrow,
    isJsxAttributeEmpty,
    isJsxTagElement,
    removeClassNameFromStringLiteral,
    removeJsxAttribute,
} from '@sourcegraph/codemod-toolkit-ts'

import { isClassNamesCallExpression } from './classNames'

export interface RemoveClassNameAndUpdateParentResult {
    isRemoved: boolean
    manualChangeLog?: ManualChangeLog
}

/**
 * Removes className from `StringLiteral` and updates parent `JsxElement` `className` prop.
 */
export function removeClassNameAndUpdateJsxElement(
    stringLiteral: StringLiteral,
    className: string
): RemoveClassNameAndUpdateParentResult {
    // Skip if `StringLiteral` was forgotten.
    if (stringLiteral.wasForgotten()) {
        return { isRemoved: false }
    }

    // Throw if `StringLiteral` doesn't have `JsxTagElement` in ancestors chain.
    const jsxTagElement = getParentUntilOrThrow(stringLiteral, isJsxTagElement)
    const parent = stringLiteral.getParent()

    /**
     * Only two parent types are currently supported: `CallExpression` and `JsxAttribute`.
     * TODO: handle `ConditionalExpression` and `BinaryExpression` parents.
     */
    if (isClassNamesCallExpression(parent) || Node.isJsxAttribute(parent)) {
        removeClassNameFromStringLiteral(stringLiteral, className)

        /**
         * In case `StringLiteral` represents empty string after className removal
         * and parent is a `classNames` `CallExpression` -> remove `StringLiteral` and
         * check if we can remove `classNames` call.
         *
         * 1. className={classNames('', props.className)} -> className={classNames(props.className)}
         * 2. className={classNames('')} -> className={}
         */
        if (stringLiteral.getLiteralValue().length === 0 && isClassNamesCallExpression(parent)) {
            parent.removeArgument(stringLiteral)
            removeClassNamesCallIfPossible(parent)
        }

        // Remove `className` JsxAttribute if it's empty.
        if (isJsxAttributeEmpty(jsxTagElement, 'className')) {
            removeJsxAttribute(jsxTagElement, 'className')
        }

        return { isRemoved: true }
    }

    return {
        isRemoved: false,
        manualChangeLog: {
            message: `'${parent.getKindName()}' parent is not supported. Please complete the transform manually.`,
            node: parent,
        },
    }
}

/**
 * Removes `classNames` utility call from `JsxExpression` if it's redundant.
 */
function removeClassNamesCallIfPossible(callExpression: CallExpression): void {
    const parent = callExpression.getParent()

    if (Node.isJsxExpression(parent)) {
        const callArguments = callExpression.getArguments()

        // Remove call expression if it contains only one argument and it's not a logical expression
        if (callArguments.length === 1) {
            const [callArgument] = callArguments

            if (
                Node.isConditionalExpression(callArgument) ||
                Node.isBinaryExpression(callArgument) ||
                Node.isObjectLiteralExpression(callArgument)
            ) {
                return
            }

            if (Node.isStringLiteral(callArgument)) {
                // className={classNames('d-flex')} -> className="d-flex"
                parent.replaceWithText(callArgument.getText())
            } else {
                // className={classNames(props.className)} -> className={props.className}
                callExpression.replaceWithText(callArgument.getText())
            }
        }

        // className={classNames()} -> className={undefined}
        if (callArguments.length === 0) {
            callExpression.replaceWithText('undefined')
        }
    }
}
