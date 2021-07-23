import { writeFileSync, rmSync } from 'fs'
import path from 'path'

import { createCssProcessor } from './createCssProcessor'
import { postcssToCssModulePlugin } from './postcssToCssModulePlugin'

const transformFileToCssModuleProcessor = createCssProcessor(postcssToCssModulePlugin())

interface TransformFileToCssModuleResult {
    css: string
    filePath: string
}

export async function transformFileToCssModule(
    sourceCss: string,
    sourceFilePath: string
): Promise<TransformFileToCssModuleResult> {
    const transformedResult = await transformFileToCssModuleProcessor(sourceCss)

    const { dir, name } = path.parse(sourceFilePath)
    const newFilePath = path.join(dir, `${name}.module.scss`)

    // TODO: add option to write files.
    // eslint-disable-next-line no-constant-condition
    if (false) {
        writeFileSync(newFilePath, transformedResult.css)
        rmSync(sourceFilePath)
    }

    return {
        css: transformedResult.css,
        filePath: newFilePath,
    }
}
