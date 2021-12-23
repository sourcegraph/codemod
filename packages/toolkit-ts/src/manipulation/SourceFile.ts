import { SourceFile, SyntaxKind } from 'ts-morph'

export function checkIfFileHasIdentifier(sourceFile: SourceFile, identifierString: string): boolean {
    return sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).some(identifier => {
        return identifier.getText() === identifierString
    })
}
