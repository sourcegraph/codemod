import path from 'path'

import { Project, QuoteKind, SourceFile } from 'ts-morph'

export interface CreateSourceFileResult {
    project: Project
    sourceFile: SourceFile
}

export const DEFAULT_FILE_NAME = 'test.tsx'

// TODO: get rid of `.replace()` call.
export const DEFAULT_FILE_PATH = path.resolve(__dirname, `./fixtures/src/${DEFAULT_FILE_NAME}`).replace('dist', 'src')

export function createSourceFile(fileSource: string, fileName = DEFAULT_FILE_PATH): CreateSourceFileResult {
    const project = new Project({
        useInMemoryFileSystem: true,
        skipLoadingLibFiles: true,
        manipulationSettings: {
            quoteKind: QuoteKind.Single,
        },
    })

    return {
        project,
        sourceFile: project.createSourceFile(fileName, fileSource),
    }
}
