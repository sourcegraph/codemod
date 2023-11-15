// TODO: replace with generic interfaces that can be reused for CSS transforms.
import { Project, SourceFile } from 'ts-morph'

import { ManualChangesReported } from '@sourcegraph/codemod-common'

export interface TransformOptions extends Object {}

export interface CodemodContext<T extends TransformOptions = TransformOptions> {
    project: Project
    transformOptions?: T
    /** If `true` persist changes made by the codemod to the filesystem. */
    shouldWriteFiles?: boolean
    /** If `true` format Typescript source files with `prettier-eslint`. */
    shouldFormat?: boolean
    classname: 'classnames' | 'clsx'
}

export interface CodemodResultFile {
    source: string
    path: string
}

export interface CodemodResult {
    target: SourceFile
    manualChangesReported: ManualChangesReported
    files?: CodemodResultFile[]
    fsWritePromise?: Promise<unknown>
}

export type Codemod<T extends TransformOptions = TransformOptions> = (
    codemodContext: CodemodContext<T>
) => Promise<CodemodResult[]>
