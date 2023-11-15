import { Node, ts, SourceFile, CallExpression } from 'ts-morph'

import { addOrUpdateImportIfIdentifierIsUsed, isImportedFromModule } from '@sourcegraph/codemod-toolkit-ts'

export const CLASSNAMES_IDENTIFIER = 'classNames'
export const CLASSNAMES_MODULE_SPECIFIER = CLASSNAMES_IDENTIFIER.toLowerCase()

// Wraps an array of arguments in a `classNames` function call.
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

export const CLSX_IDENTIFIER = 'clsx'

// Wraps an array of arguments in a `clsx` function call.
export function wrapIntoClsxUtility(classNames: ts.Expression[]): ts.CallExpression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier(CLSX_IDENTIFIER), undefined, classNames)
}

// Adds `clsx` import to the `sourceFile` if `classNames` util is used and import doesn't exist.
export function addClsxUtilImportIfNeeded(sourceFile: SourceFile): void {
    addOrUpdateImportIfIdentifierIsUsed({
        sourceFile,
        importStructure: {
            defaultImport: CLSX_IDENTIFIER,
            moduleSpecifier: CLSX_IDENTIFIER,
        },
    })
}

interface Utility {
    wrapper: (classNames: ts.Expression[]) => ts.CallExpression,
    importer: (sourceFile: SourceFile) => void,
    identifier: string
}

export const utilities: Record<'clsx' | 'classnames', Utility> = {
    clsx: {
        wrapper: wrapIntoClsxUtility,
        importer: addClsxUtilImportIfNeeded,
        identifier: CLSX_IDENTIFIER
    },
    classnames: {
        wrapper: wrapIntoClassNamesUtility,
        importer: addClassNamesUtilImportIfNeeded,
        identifier: CLASSNAMES_IDENTIFIER
    }
}
