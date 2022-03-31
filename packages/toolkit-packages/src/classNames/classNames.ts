import { Node, ts, SourceFile, CallExpression } from 'ts-morph'

import { addOrUpdateImportIfIdentifierIsUsed, isImportedFromModule } from '@sourcegraph/codemod-toolkit-ts'

export const CLASSNAMES_IDENTIFIER = 'classNames'
export const CLASSNAMES_MODULE_SPECIFIER = CLASSNAMES_IDENTIFIER.toLowerCase()

// Wraps array of arguments into a `classNames` function call.
export function wrapIntoClassNamesUtility(classNames: ts.Expression[]): ts.CallExpression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier(CLASSNAMES_IDENTIFIER), undefined, classNames)
}

// Adds `classnames` import to the `sourceFile` if `classNames` util is used and import doesn't exist.
export function addClassNamesUtilImportIfNeeded(sourceFile: SourceFile): void {
    addOrUpdateImportIfIdentifierIsUsed({
        sourceFile,
        importStructure: {
            defaultImport: CLASSNAMES_IDENTIFIER,
            moduleSpecifier: CLASSNAMES_MODULE_SPECIFIER,
        },
    })
}

// TODO: use type information to verify classNames utility call.
export function isClassNamesCallExpression(node?: Node): node is CallExpression {
    return Node.isCallExpression(node) && isImportedFromModule(node.getExpression(), CLASSNAMES_MODULE_SPECIFIER)
}
