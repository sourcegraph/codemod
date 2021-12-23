import { Node, JsxExpression, StringLiteral } from 'ts-morph'

import { setOnJsxTagElement, JsxTagElement } from './JsxTagElement'

export function removeJsxAttribute(jsxTagElement: JsxTagElement, attributeName: string): JsxTagElement {
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
