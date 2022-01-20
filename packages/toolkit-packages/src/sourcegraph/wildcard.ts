import { SourceFile } from 'ts-morph'

import {
    AddImportIfIdentifierIsUsedOptions,
    addOrUpdateImportIfIdentifierIsUsed,
} from '@sourcegraph/codemod-toolkit-ts'

export const SOURCEGRAPH_WILDCARD_MODULE_SPECIFIER = '@sourcegraph/wildcard'

interface AddOrUpdateSourcegraphWildcardImportIfNeededOptions {
    sourceFile: SourceFile
    importStructure: Omit<AddImportIfIdentifierIsUsedOptions['importStructure'], 'moduleSpecifier'>
}

export function addOrUpdateSourcegraphWildcardImportIfNeeded(
    options: AddOrUpdateSourcegraphWildcardImportIfNeededOptions
): void {
    const { sourceFile, importStructure } = options

    addOrUpdateImportIfIdentifierIsUsed({
        sourceFile,
        importStructure: {
            moduleSpecifier: SOURCEGRAPH_WILDCARD_MODULE_SPECIFIER,
            ...importStructure,
        },
    })
}
