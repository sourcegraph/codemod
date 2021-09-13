import { Project } from 'ts-morph'

export interface CodemodTransformResult {
    css?: {
        source: string
        path: string
    }
    ts?: {
        source: string
        path: string
    }
    fsWritePromise?: Promise<void[]>
}

export type CodemodResult = Promise<CodemodTransformResult[] | false>

export interface CodemodOptions {
    project: Project
    /** If `true` persist changes made by the codemod to the filesystem. */
    shouldWriteFiles?: boolean
}
