import { ts, printNode } from 'ts-morph'

import { JsxTagElement } from './JsxTagElement'

// TODO: figure how to do it more reliably.
export function isHTMLTagName(name: string): boolean {
    return name.startsWith(name[0].toLowerCase())
}

export function addAsJsxAttribute(node: JsxTagElement, tagName: string): JsxTagElement {
    const initializer = isHTMLTagName(tagName)
        ? ts.factory.createStringLiteral(tagName)
        : ts.factory.createJsxExpression(undefined, ts.factory.createIdentifier(tagName))

    node.addAttribute({
        name: 'as',
        initializer: printNode(initializer),
    })

    return node
}
