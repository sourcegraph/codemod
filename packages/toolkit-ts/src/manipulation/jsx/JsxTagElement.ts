import { JsxElementStructure, JsxOpeningElement, JsxSelfClosingElement, Node, ts } from 'ts-morph'

/**
 * Union type for JSX element with JSX attributes to avoid
 * handling `JsxOpeningElement` and `JsxSelfClosingElement` separately every time.
 */
export type JsxTagElement = JsxOpeningElement | JsxSelfClosingElement
export type JsxTagElementStructure = Partial<Omit<JsxElementStructure, 'kind'>>

export function isJsxTagElement(node: Node<ts.Node>): node is JsxTagElement {
    return Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)
}

export function setOnJsxTagElement(node: JsxTagElement, structure: JsxTagElementStructure): JsxTagElement {
    if (Node.isJsxSelfClosingElement(node)) {
        node.set(structure)
    } else {
        node.getParent().set(structure)
    }

    return node
}

export function getTagName(node: JsxTagElement): string {
    return node.getTagNameNode().getText()
}
