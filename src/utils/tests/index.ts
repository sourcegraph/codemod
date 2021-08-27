import { Project, SourceFile } from 'ts-morph'

export function createSourceFile(fileSource: string): SourceFile {
    const project = new Project()

    return project.createSourceFile('test.tsx', fileSource)
}
