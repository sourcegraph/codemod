import { ts, SourceFile, SyntaxKind } from 'ts-morph'
import { Expression } from 'typescript'

export const CLASSNAMES_IDENTIFIER = 'classNames'
export const CLASSNAMES_MODULE_SPECIFIER = CLASSNAMES_IDENTIFIER.toLowerCase()

// Wraps array of arguments into a `classNames` function call.
export function wrapIntoClassNamesUtility(classNames: Expression[]): ts.CallExpression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier(CLASSNAMES_IDENTIFIER), undefined, classNames)
}

// Adds `classnames` import to the `sourceFile` if `classNames` util is used and import doesn't exist.
export function addClassNamesUtilImportIfNeeded(sourceFile: SourceFile): void {
    const isClassNamesUsed = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).some(identifier => {
        return identifier.getText() === CLASSNAMES_IDENTIFIER
    })

    const hasClassNamesImport = sourceFile.getImportDeclarations().some(declaration => {
        return declaration.getModuleSpecifier().getLiteralText() === CLASSNAMES_MODULE_SPECIFIER
    })

    if (isClassNamesUsed && !hasClassNamesImport) {
        sourceFile.addImportDeclaration({
            defaultImport: CLASSNAMES_IDENTIFIER,
            moduleSpecifier: CLASSNAMES_MODULE_SPECIFIER,
        })
    }
}
