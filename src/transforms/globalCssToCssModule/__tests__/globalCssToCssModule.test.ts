import path from 'path'

import { Project } from 'ts-morph'

import { globalCssToCssModule } from '../globalCssToCssModule'

const TARGET_FILE = path.resolve(__dirname, './fixtures/Kek.tsx')

describe('globalCssToCssModule', () => {
    it('transforms correctly', async () => {
        const project = new Project()
        project.addSourceFilesAtPaths(TARGET_FILE)
        const [transformResult] = await globalCssToCssModule({ project })

        expect(transformResult.css.source).toMatchSnapshot()
        expect(transformResult.ts.source).toMatchSnapshot()
    }, 15000) // Timeout of 15s (default is 5s). `prettier-eslint` format is slow 😬.
})
