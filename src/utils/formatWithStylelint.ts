import { lint } from 'stylelint'

export async function formatWithStylelint(sourceCode: string, filePath: string): Promise<string> {
    const lintResult = await lint({
        code: sourceCode,
        codeFilename: filePath,
        fix: true,
        configOverrides: {
            rules: {
                // Hard-coded for now. Make it optional or delete it once it's not needed.
                indentation: 4,
            },
        },
    })

    return lintResult.output
}
