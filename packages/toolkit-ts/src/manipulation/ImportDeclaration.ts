import { ImportDeclaration, ImportDeclarationStructure, OptionalKind, SourceFile } from 'ts-morph'

import { hasIdentifier } from './SourceFile'

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
 * Adds missing import declarations to the `SourceFile` if provided literals are used in the code.
 */
export function addOrUpdateImportIfIdentifierIsUsed(options: AddImportIfIdentifierIsUsedOptions): void {
    const { sourceFile, importStructure } = options
    const { namedImports = [], defaultImport, moduleSpecifier } = importStructure

    // Filer unused `namedImports` from the provided list.
    const usedNamedImports = namedImports.filter(namedImport => {
        return hasIdentifier(sourceFile, namedImport)
    })

    // Filter unused `defaultImport`.
    const usedDefaultImport = defaultImport && hasIdentifier(sourceFile, defaultImport) ? defaultImport : undefined

    // If we have nothing to add to the `ImportDeclaration` after filtering, stop there.
    if (usedNamedImports.length === 0 && usedDefaultImport === undefined) {
        return
    }

    const importDeclaration = getImportDeclarationByModuleSpecifier(sourceFile, moduleSpecifier)

    if (importDeclaration) {
        // If there is an `importDeclaration` for the target`moduleSpecifier`, update it instead of creating a new one.
        for (const namedImportToAdd of usedNamedImports) {
            const isAlreadyAdded = importDeclaration.getNamedImports().some(existingImport => {
                return existingImport.getName() === namedImportToAdd
            })

            if (!isAlreadyAdded) {
                importDeclaration.addNamedImport(namedImportToAdd)
            }
        }

        if (usedDefaultImport && importDeclaration.getDefaultImport()?.getText() !== usedDefaultImport) {
            importDeclaration.setDefaultImport(usedDefaultImport)
        }
    } else {
        // Otherwise, create a new `ImportDeclaration` with used identifiers.
        sourceFile.addImportDeclaration({
            namedImports: usedNamedImports,
            defaultImport: usedDefaultImport,
            moduleSpecifier,
        })
    }
}
