import format from 'prettier-eslint'
import { SourceFile } from 'ts-morph'

export function formatWithPrettierEslint(sourceFile: SourceFile): SourceFile {
    const filePath = sourceFile.getFilePath().toString()

    sourceFile.replaceWithText(
        format({
            text: sourceFile.getFullText(),
            filePath,
        })
    )

    return sourceFile
}
