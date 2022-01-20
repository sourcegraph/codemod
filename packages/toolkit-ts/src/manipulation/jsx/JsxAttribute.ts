import { Node, JsxExpression, StringLiteral } from 'ts-morph'

import { setOnJsxTagElement, JsxTagElement } from './JsxTagElement'

export function removeJsxAttribute(jsxTagElement: JsxTagElement, attributeName: string): JsxTagElement {
    /**
     * 1. Filter out `JsxAttribute` with the target name.
     * 2. Convert the rest of attributes to JSON structure.
     * 3. Use this array to update structure of the `JsxTagElement`.
     */
    const updatedAttributes = jsxTagElement
        .getAttributes()
        .filter(attribute => {
            if (Node.isJsxAttribute(attribute)) {
                return attribute.getName() !== attributeName
            }

            return true
        })
        .map(attribute => {
            return attribute.getStructure()
        })

    setOnJsxTagElement(jsxTagElement, { attributes: updatedAttributes })

    return jsxTagElement
}

export function getJsxAttributeInitializer(
    jsxTagElement: JsxTagElement,
    attributeName: string
): StringLiteral | JsxExpression | undefined {
    const attribute = jsxTagElement.getAttribute(attributeName)

    if (attribute && Node.isJsxAttribute(attribute)) {
        return attribute.getInitializer()
    }

    return undefined
}

export function getJsxAttributeStringValue(jsxTagElement: JsxTagElement, attributeName: string): string | undefined {
    const initializer = getJsxAttributeInitializer(jsxTagElement, attributeName)

    if (Node.isStringLiteral(initializer)) {
        return initializer.getLiteralValue()
    }

    return undefined
}

export function isJsxAttributeEmpty(jsxTagElement: JsxTagElement, attributeName: string): boolean {
    const initializer = getJsxAttributeInitializer(jsxTagElement, attributeName)

    // Return `false` if attribute does not exist.
    if (typeof initializer === 'undefined') {
        return false
    }

    // Check for empty expression: `<div className={} />`
    if (Node.isJsxExpression(initializer)) {
        const expression = initializer.getExpression()

        return expression === undefined || expression.getText() === 'undefined'
    }

    // Check for empty string: `<div className="" />`
    if (Node.isStringLiteral(initializer)) {
        return initializer.getLiteralValue() === ''
    }

    return true
}
