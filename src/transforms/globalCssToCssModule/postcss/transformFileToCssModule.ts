import path from 'path'

import { createCssProcessor } from './createCssProcessor'
import { postcssToCssModulePlugin } from './postcssToCssModulePlugin'

interface TransformFileToCssModuleOptions {
    sourceCss: string
    sourceFilePath: string
}

interface TransformFileToCssModuleResult {
    css: string
    filePath: string
}

export async function transformFileToCssModule(
    options: TransformFileToCssModuleOptions
): Promise<TransformFileToCssModuleResult> {
    const { sourceCss, sourceFilePath } = options

    const transformFileToCssModuleProcessor = createCssProcessor(postcssToCssModulePlugin())
    const transformedResult = await transformFileToCssModuleProcessor(sourceCss)

    const { dir, name } = path.parse(sourceFilePath)
    const newFilePath = path.join(dir, `${name}.module.scss`)

    return {
        css: transformedResult.css,
        filePath: newFilePath,
    }
}
