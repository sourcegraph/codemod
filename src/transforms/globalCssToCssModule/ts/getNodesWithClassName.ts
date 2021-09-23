import { StringLiteral, Identifier, SyntaxKind, SourceFile } from 'ts-morph'

export function getNodesWithClassName(sourceFile: SourceFile): (Identifier | StringLiteral)[] {
    const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    const classNameJsxAttributes = jsxAttributes.filter(identifier => identifier.getName() === 'className')

    // <div className={classNames({ kek: isActive })} /> — 'kek' is an `Identifier` inside of the `PropertyAssignment`.
    const classNameIdentifiers = classNameJsxAttributes
        .flatMap(classNameJsxAttribute => classNameJsxAttribute.getDescendantsOfKind(SyntaxKind.Identifier))
        .filter(identifier => identifier.getParent().compilerNode.kind === SyntaxKind.PropertyAssignment)

    // <div className='kek' /> — 'kek' is a `StringLiteral` inside  of the `JsxAttribute`.
    const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral)

    return [...classNameIdentifiers, ...stringLiterals]
}
