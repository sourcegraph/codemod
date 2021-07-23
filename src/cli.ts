import path from 'path'

import { Project } from 'ts-morph'

import { globalCssToCssModule } from './transforms/globalCssToCssModule/globalCssToCssModule'

// TODO: add interactive CLI support
const TARGET_FILE = path.resolve(__dirname, './transforms/globalCssToCssModule/__tests__/fixtures/Kek.tsx')

async function main(): Promise<void> {
    const project = new Project()
    project.addSourceFilesAtPaths(TARGET_FILE)

    const result = await globalCssToCssModule(project)
    console.log(result)
}

main().catch(error => {
    throw error
})
