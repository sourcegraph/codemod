// Used for parsing a transform module.
import 'ts-node/register/transpile-only'
import path from 'path'

import { Command } from 'commander'
import signale from 'signale'
import { dedent } from 'ts-dedent'
// TODO: replace project with generic interface that can be used for CSS codemods.
import { Project } from 'ts-morph'

import { logRequiredManualChanges } from '@sourcegraph/codemod-common'

import { Codemod, CodemodContext, TransformOptions } from './types'

const program = new Command()

interface CodemodCliOptions extends TransformOptions {
    write: boolean
    format: boolean
    transform: string
}

const PROJECT_ROOT = path.resolve(__dirname, '../../../')

program
    // TODO: make it `true` by default after switching to fast bulk format.
    .option('-f, --format [format]', 'Format Typescript source files with ESLint', false)
    .option('-w, --write [write]', 'Persist codemod changes to the filesystem', false)
    .option('-t, --transform <transform>', 'Absolute or relative to project root path to a transform module')
    .argument('<fileGlob>', 'Absolute or relative to project root file glob to change files based on')
    .allowUnknownOption(true)
    .enablePositionalOptions(true)
    .addHelpText(
        'after',
        dedent`

        Transform-specific options can be passed via using '--option=value' syntax:
        yarn transform --write --tagToConvert=Link -t ./transformPath.ts 'globPath/**/*.{ts,tsx}'
    `
    )
    .action(async (commandArgument: string, options: CodemodCliOptions) => {
        const { fileGlob, transformOptions } = parseOptions(commandArgument)
        const { write: shouldWriteFiles, format: shouldFormat, transform } = options

        const projectGlob = path.isAbsolute(fileGlob) ? fileGlob : path.join(PROJECT_ROOT, fileGlob)
        const transformPath = path.isAbsolute(transform) ? transform : path.join(PROJECT_ROOT, transform)

        signale.start(`Starting codemod "${transformPath}" with the project glob "${projectGlob}".`)

        const project = new Project()
        project.addSourceFilesAtPaths(projectGlob)

        const transformExports = Object.values(await import(transformPath))
        if (transformExports.length !== 1) {
            throw new Error('Transform file should have one named export with the transform function.')
        }

        const [codemod] = transformExports
        const codemodContext: CodemodContext = {
            project,
            shouldWriteFiles,
            shouldFormat,
            transformOptions,
        }

        const results = await (codemod as Codemod)(codemodContext)

        results.map(result => {
            logRequiredManualChanges(result.manualChangesReported)
        })

        if (shouldWriteFiles) {
            signale.await('Persisting codemod changes to the filesystem...')
            await Promise.all(
                results.map(result => {
                    return result.fsWritePromise
                })
            )
            signale.complete('Persisting codemod changes completed.')
        } else {
            for (const file of results.flatMap(result => {
                return result.files
            })) {
                signale.log(file?.source)
            }
        }

        signale.success('Codemod is applied!')
    })

program.parse(process.argv)

interface ParseOptionsResult {
    fileGlob: string
    transformOptions: TransformOptions
}

function parseOptions(commandArgument: string): ParseOptionsResult {
    const { unknown } = program.parseOptions(process.argv)

    // TODO: find a better way to process and validate `transformOptions`.
    const fileGlob = unknown.pop() || commandArgument

    const transformOptions = unknown.reduce<Record<string, unknown>>((result, key) => {
        const [name, value = true] = key.split('=')
        result[name.replace('--', '')] = value

        return result
    }, {})

    return { fileGlob, transformOptions }
}
