import { lint } from 'stylelint'

export async function formatWithStylelint(sourceCode: string, filePath: string): Promise<string> {
    const lintResult = await lint({
        code: sourceCode,
        codeFilename: filePath,
        fix: true,
        configOverrides: {
            rules: {
                indentation: 4,
            },
        },
    })

    return lintResult.output
}
