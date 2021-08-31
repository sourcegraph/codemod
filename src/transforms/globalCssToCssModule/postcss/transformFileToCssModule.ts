import path from 'path'

import { createCssProcessor } from './createCssProcessor'
import { postcssToCssModulePlugin } from './postcssToCssModulePlugin'

interface TransformFileToCssModuleResult {
    css: string
    filePath: string
}

export async function transformFileToCssModule(
    sourceCss: string,
    sourceFilePath: string
): Promise<TransformFileToCssModuleResult> {
    const transformFileToCssModuleProcessor = createCssProcessor(postcssToCssModulePlugin())
    const transformedResult = await transformFileToCssModuleProcessor(sourceCss)

    const { dir, name } = path.parse(sourceFilePath)
    const newFilePath = path.join(dir, `${name}.module.scss`)

    // TODO: add option to write files.
    return {
        css: transformedResult.css,
        filePath: newFilePath,
    }
}
