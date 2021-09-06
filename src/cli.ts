import path from 'path'

import { Command, Option } from 'commander'
import signale from 'signale'
import { Project } from 'ts-morph'

import { transforms, transformNames } from './transforms'

const program = new Command()

interface CodemodCliOptions {
    write: boolean
    format: boolean
    transform: keyof typeof transforms
}

program
    .addOption(
        new Option('-t, --transform <transform>', 'Transform name').choices(transformNames).makeOptionMandatory()
    )
    .option('-w, --write [write]', 'Persist codemod changes to the filesystem', false)
    .argument('<fileGlob>', 'File glob or globs to change files based on')
    .action(async (fileGlob: string, options: CodemodCliOptions) => {
        const { write: shouldWriteFiles, transform } = options
        const projectGlob = path.isAbsolute(fileGlob) ? fileGlob : path.join(process.cwd(), fileGlob)

        signale.start(`Starting codemod "${transform}" with project glob "${projectGlob}"`)

        const project = new Project()
        project.addSourceFilesAtPaths(projectGlob)

        const results = await transforms[transform]({ project, shouldWriteFiles })

        if (results) {
            if (shouldWriteFiles) {
                signale.info('Persisting codemod changes to the filesystem...')
                await Promise.all(results.map(result => result.fsWritePromise))
                signale.info('Persisting codemod changes completed')
            } else {
                console.log(results)
            }

            signale.success('Files are transformed!')
        }
    })

program.parse(process.argv)
