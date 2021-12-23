import { ImportDeclaration, ImportDeclarationStructure, OptionalKind, SourceFile } from 'ts-morph'

import { checkIfFileHasIdentifier } from './SourceFile'

export function getImportDeclarationByModuleSpecifier(
    sourceFile: SourceFile,
    moduleSpecifier: string
): ImportDeclaration | undefined {
    return sourceFile.getImportDeclarations().find(importDeclaration => {
        return importDeclaration.getModuleSpecifierValue() === moduleSpecifier
    })
}

export interface AddImportIfIdentifierIsUsedOptions {
    sourceFile: SourceFile
    importStructure: Omit<OptionalKind<ImportDeclarationStructure>, 'namedImports'> & {
        namedImports?: string[]
    }
}

/**
 * Adds missing declarations to the source file if literals from the provided import structure are used in the code.
 * TODO: use type information instead of literal names to understand what needs to be changed.
 */
export function addOrUpdateImportIfIdentifierIsUsed(options: AddImportIfIdentifierIsUsedOptions): void {
    const { sourceFile, importStructure } = options
    const { namedImports, defaultImport, moduleSpecifier } = importStructure

    const usedNamedImports = namedImports?.filter(namedImport => {
        return checkIfFileHasIdentifier(sourceFile, namedImport)
    })

    const usedDefaultImport =
        defaultImport && checkIfFileHasIdentifier(sourceFile, defaultImport) ? defaultImport : undefined

    const importDeclaration = getImportDeclarationByModuleSpecifier(sourceFile, moduleSpecifier)

    if (importDeclaration) {
        if (usedNamedImports) {
            for (const namedImport of usedNamedImports) {
                const isAddedAlready = importDeclaration.getNamedImports().some(existingImport => {
                    return existingImport.getName() === namedImport
                })

                if (!isAddedAlready) {
                    importDeclaration.addNamedImport(namedImport)
                }
            }
        }

        if (usedDefaultImport && importDeclaration.getDefaultImport()?.getText() !== usedDefaultImport) {
            importDeclaration.setDefaultImport(usedDefaultImport)
        }
    } else if ((usedNamedImports && usedNamedImports.length > 0) || usedDefaultImport) {
        sourceFile.addImportDeclaration({
            namedImports: usedNamedImports,
            defaultImport: usedDefaultImport,
            moduleSpecifier,
        })
    }
}
