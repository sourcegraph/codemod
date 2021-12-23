import { Project, SourceFile } from 'ts-morph'

export interface CreateSourceFileResult {
    project: Project
    sourceFile: SourceFile
}

export function createSourceFile(fileSource: string, fileName = 'test.tsx'): CreateSourceFileResult {
    const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true })

    return {
        project,
        sourceFile: project.createSourceFile(fileName, fileSource),
    }
}
